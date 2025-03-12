---
sidebar_position: 6
---

# Deployment

Deploying Shraga is simple and quick. You can do it on any platform that supports Docker containers, such as Kubernetes or Amazon Elastic Container Service (ECS).

- [Kubernetes](#kubernetes)
- [Amazon Elastic Container Service (ECS)](#amazon-elastic-container-service-ecs)

## 1. Kubernetes

To deploy Shraga on Kubernetes, create a Secret for the configuration file:

```bash
kubectl create secret generic shraga-config --from-file=config.yaml
```

Then, create the deployment spec in a file called `shraga-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: shraga-deployment
  namespace: default
  labels:
    app: shraga-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: shraga-app
  template:
    metadata:
      labels:
        app: shraga-app
    spec:
      containers:
        - name: shraga-app
          image: r.bigdataboutique.com/shraga:latest
          env:
            - name: CONFIG_PATH
              value: "/config/config.yaml"
          ports:
            - name: http
              containerPort: 8000
          imagePullPolicy: IfNotPresent
          volumeMounts:
            - name: config-volume
              mountPath: "/config"
              readOnly: true
      volumes:
        - name: config-volume
          secret:
            secretName: shraga-config
```

Create the service spec in a file called `shraga-service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: shraga-service
  namespace: default
  labels:
    app: shraga-app
spec:
  selector:
    app: shraga-app
  ports:
    - protocol: TCP
      port: 8000
      targetPort: 8000
```

Apply the manifests:

```bash
kubectl apply -f shraga-deployment.yaml
kubectl apply -f shraga-service.yaml
```

The `config.yaml` file will be stored as a Kubernetes Secret and mounted securely into the container.

## 2. Amazon Elastic Container Service (ECS)

To deploy Shraga on ECS, you must first register the task definition and then create a service in your ECS cluster.

### 2.1 For EC2 launch type

For EC2-based ECS deployments, the configuration file needs to be mounted directly on the EC2 host and linked to the container. Follow these steps:

#### Register the Task Definition

Before deploying Shraga on ECS, ensure the task definition is registered with your AWS account.

Create a file called `shraga-task.json`:

```json
{
  "family": "shraga-app",
  "cpu": 1024,
  "memory": 2048,
  "containerDefinitions": [
    {
      "name": "shraga-app",
      "image": "r.bigdataboutique.com/shraga:latest",
      "essential": true,
      "environment": [
        { "name": "CONFIG_PATH", "value": "/config/config.yaml" }
      ],
      "portMappings": [{ "containerPort": 8000, "hostPort": 8000 }],
      "mountPoints": [
        {
          "sourceVolume": "conf-vol",
          "containerPath": "/config"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/shraga",
          "awslogs-region": "<aws_region>",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "volumes": [
    {
      "name": "conf-vol",
      "host": {
        "sourcePath": "/path/to/your/config.yaml"
      }
    }
  ]
}
```

Replace the following as needed:

- `<aws_region>` – Your AWS region.
- `/path/to/your/config.yaml` – Path to your Shraga configuration file on the EC2 host.

Register the task definition using this command:

```bash
aws ecs register-task-definition --cli-input-json file://shraga-task.json
```

#### Create a Service

After registering the task definition, create a service in the desired cluster:

```bash
aws ecs create-service --cluster <ECS_CLUSTER_NAME> \
    --service-name shraga-service \
    --task-definition shraga-app \
    --desired-count 1 \
    --launch-type "EC2" \
    --network-configuration "awsvpcConfiguration={subnets=[<subnet-abcd1234>],securityGroups=[<sg-abcd1234>]}
```

Replace the following as needed:

- `<ECS_CLUSTER_NAME>` – The name of your ECS cluster.
- `<subnet-abcd1234>` – Subnets for the task.
- `<sg-abcd1234>` – Security groups for the task.

### 2.2 For Fargate launch type

For Fargate-based ECS deployments, the process remains largely the same. However, since Fargate does not allow mounting files directly from the host, you should use an init container to pull the configuration file from an external source (such as AWS Secret Manager, S3, or another service) and place it into the app container. The steps below assume you have the configuration file stored in an S3 bucket.

#### Create an Init Container

Create a Docker image for the init container that pulls the configuration file from S3 and places it in a shared volume with the app container.

```Dockerfile
FROM --platform=linux/amd64 public.ecr.aws/aws-cli/aws-cli:latest

ENV SOURCE_BUCKET=janow
ENV DEST_VOL=vol1
ENV FILE=config.yaml

ENTRYPOINT ["/bin/sh", "-c", "aws s3 cp s3://$SOURCE_BUCKET/$FILE /$DEST_VOL/$FILE"]
```

#### Register the Task Definition

Before deploying Shraga on ECS, ensure the task definition is registered with your AWS account.

Create a file called `shraga-task.json`:

```json
{
  "family": "shraga-app",
  "cpu": 1024,
  "memory": 2048,
  "containerDefinitions": [
    {
      "name": "shraga-app",
      "image": "r.bigdataboutique.com/shraga:latest",
      "essential": true,
      "environment": [
        { "name": "SOURCE_BUCKET", "value": "<s3_bucket_name>" },
        { "name": "DEST_VOL", "value": "vol1" },
        { "name": "DEST_FILE", "value": "config.yaml" }
      ],
      "mountPoints": [
        {
          "sourceVolume": "conf-vol",
          "containerPath": "/vol1"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/shraga",
          "awslogs-region": "<aws_region>",
          "awslogs-stream-prefix": "ecs"
        }
      }
    },
    {
      "name": "shraga-init",
      "image": "<shraga_init_ecr_repo>:latest",
      "cpu": 1024,
      "memory": 2048,
      "essential": false,
      "environment": [
        { "name": "CONFIG_PATH", "value": "/config/config.yaml" }
      ],
      "portMappings": [{ "containerPort": 8000, "hostPort": 8000 }],
      "mountPoints": [
        {
          "sourceVolume": "conf-vol",
          "containerPath": "/vol1"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/shraga",
          "awslogs-region": "<aws_region>",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "volumes": [
    {
      "name": "conf-vol",
      "host": {}
    }
  ]
}
```

Replace the following as needed:

- `<s3_bucket_name>` – The S3 bucket name where the configuration file is stored.
- `<shraga_init_ecr_repo>` – The ECR repository for the init container.
- `<aws_region>` – Your AWS region.

Register the task definition using this command:

```bash
aws ecs register-task-definition --cli-input-json file://shraga-task.json
```

#### Create a Service

After registering the task definition, create a service in the desired cluster:

```bash
aws ecs create-service --cluster <ECS_CLUSTER_NAME> \
    --service-name shraga-service \
    --task-definition shraga-app \
    --desired-count 1 \
    --launch-type "FARGATE" \
    --network-configuration "awsvpcConfiguration={subnets=[<subnet-abcd1234>],securityGroups=[<sg-abcd1234>]}
```

Replace the following as needed:

- `<ECS_CLUSTER_NAME>` – The name of your ECS cluster.
- `<subnet-abcd1234>` – Subnets for the task.
- `<sg-abcd1234>` – Security groups for the task.
