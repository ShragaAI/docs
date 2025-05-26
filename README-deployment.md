# Shraga Deployment Guide (ECS + Terraform)

This document outlines the process for deploying Shraga on AWS ECS using Terraform.

---

## 1. Top-Level Overview

Shraga provides a Terraform module that provisions the necessary AWS infrastructure, including ECS tasks, ALB, and config injection. Deployment involves setting up networking, IAM, container infrastructure, and CI/CD pipelines.

---

## 2. Components Overview

The setup is composed of:

- **Terraform backend**: S3 bucket + DynamoDB table (for state locking)
- **ACM**: TLS certificate for the ALB
- **VPC**: Public and private subnets with NAT Gateway
- **IAM roles**: ECS task role with access to ECR, S3, and Bedrock
- **ECS module**: Uses the Shraga Terraform module (includes ECR repos)
- **DNS**: CNAME record pointing to the ALB (can be in any DNS provider)

---

## 3. Deployment Steps

### Step 1: Create Terraform Backend

Provision an S3 bucket and DynamoDB table and configure the Terraform backend as follows:

```hcl
terraform {
  backend "s3" {
    bucket         = "<example-tfstates>"
    key            = "shraga/terraform.tfstate"
    region         = "<aws-region>"
    dynamodb_table = "shraga-tf-state-lock"
  }
}
```

### Step 2: Issue TLS Certificate

Use AWS Certificate Manager to issue a TLS certificate for the ALB domain. This can be done via the AWS console or Terraform:

```hcl
resource "aws_acm_certificate" "shraga_cert" {
  domain_name = <shraga.example.com>"
  validation_method = "DNS"
  ...
}
```

### Step 3: Set Up VPC

```hcl
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  ...
  enable_nat_gateway = true
  single_nat_gateway = true
  ...
}
```

Make sure NAT is enabled for ECS tasks in private subnets to pull images. Use a single NAT gateway for cost efficiency.

### Step 4: IAM Role for ECS Task

Create a task role with policies for ECR, S3 access, Bedrock, and any additional services required (e.g. OpenSearch):

```hcl
resource "aws_iam_role" "shraga_ecs_task_role" {
  name = "ecsShragaTaskRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "shraga_ecs_task_role_bedrock_policy" {
  role       = aws_iam_role.shraga_ecs_task_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonBedrockFullAccess"
}

resource "aws_iam_role_policy" "shraga_ecs_task_role_policy" {
  name = "shragaECSTaskExecutionRolePolicy"
  role = aws_iam_role.shraga_ecs_task_role.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:DescribeImages",
          "ecr:GetRepositoryPolicy"
        ]
        Resource = "*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "s3:Get*",
          "s3:Describe*",
          "s3:ListBucket",
          "s3:GetObjectAcl",
          "s3:GetBucketAcl",
          "s3:GetBucketLocation"
        ],
        "Resource" : ["arn:aws:s3:::<shraga-s3-bucket>/*", "arn:aws:s3:::<shraga-s3-bucket>"]
      }
    ]
  })
```

Replace `<shraga-s3-bucket>` with the actual S3 bucket name used for the configuration file.

### Step 5: Deploy ECS via Shraga Module

```hcl
module "ecs" {
  source = "git::https://github.com/ShragaAI/shraga.git//terraform/ecs?ref=main"

  aws_region      = "<aws-region>"
  vpc_id          = module.vpc.vpc_id
  ecs_subnets_ids = module.vpc.private_subnets
  alb_subnets_ids = module.vpc.public_subnets
  alb_public      = true
  alb_cert_domain = "<shraga.example.com>"

  s3_bucket        = <shraga-s3-bucket> # S3 bucket for the config file. It'll be created by the module.
  config_file_path = abspath("shraga-config.yaml")

  ecs_task_role_arn = aws_iam_role.shraga_ecs_task_role.arn
  task_replicas     = 2
  task_cpu          = "1024"
  task_memory       = "2048"
}
```

The module also creates the necessary ECR repositories. ECS task containers will initially fail until images are pushed.

### Step 6: Build and Push Docker Images

The Shraga module expects two images: `shraga_init` and `shraga`.

#### Build and push `shraga_init`

```bash
cd init
# Build the init image
docker build -t <account_id>.dkr.ecr.<region>.amazonaws.com/shraga_init:latest -f Dockerfile_init .

# Authenticate with ECR and push
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account_id>.dkr.ecr.<region>.amazonaws.com

docker push <account_id>.dkr.ecr.<region>.amazonaws.com/shraga_init:latest
```

#### Build and push `shraga`

```bash
# Build the shraga image
docker build -t <account_id>.dkr.ecr.<region>.amazonaws.com/shraga:latest .

# Push to ECR
docker push <account_id>.dkr.ecr.<region>.amazonaws.com/shraga:latest
```

Replace `<account_id>` and `<region>` with your AWS account ID and region.

The `shraga_init` image is built only once, while the `shraga` image should be built and pushed automatically through a CI/CD pipeline.

### Step 7: Restart ECS Service

Trigger a service restart to pick up new container images.

```bash
aws ecs update-service --cluster shraga --service shraga --force-new-deployment
```

This can also be done through the AWS console by selecting the ECS service and clicking "Update" with the "Force new deployment" option.

### Step 8: Create DNS Record

Create a CNAME pointing to the ALB domain. DNS can be managed through any provider, as long as it resolves to the ALB and matches the ACM certificate.

---

## 4. Common Problems & Solutions

### Problem: ECS Task Fails at Start

**Cause:** ECR repos are empty.
**Solution:** Build and push images and restart the ECS service.

### Problem: No NAT Gateway → Task Can't Pull Images

**Cause:** Private subnets can't access internet.
**Solution:** Ensure NAT gateway is provisioned and route tables are set.

### Problem: TLS Not Working on ALB

**Cause:** Certificate not validated or misconfigured ALB listener.
**Solution:** Verify ACM cert is issued and listener references the correct certificate ARN.

### Problem: Shraga module fails on config path

**Cause:** Invalid `config_file_path` or file not present at `terraform apply` time.
**Solution:** Use `abspath()` and ensure the config file exists locally.

### Problem: Missing DNS entry

**Cause:** DNS not pointing to ALB domain.
**Solution:** Create CNAME record using any DNS provider, ensuring it matches the ACM certificate domain.
