---
sidebar_position: 6
---

# Deployment

Deploying Shraga is simple and quick. You can do it on any platform that supports Docker containers, such as Kubernetes or Amazon Elastic Container Service (ECS).

- [Kubernetes](#kubernetes)
- [Amazon Elastic Container Service (ECS)](#amazon-elastic-container-service-ecs)

### Kubernetes

To deploy Shraga on Kubernetes, create the deployment spec in a file called `shraga-deployment.yaml`.

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
            - name: "config"
              mountPath: "/config"
      volumes:
        - name: "config"
          hostPath:
            path: "/path/to/your/config.yaml"
            type: Directory
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

The `config.yaml` file will be mounted from the host path `/path/to/your/config.yaml` into the container at `/config/config.yaml`.

### Amazon Elastic Container Service (ECS)

To deploy Shraga on ECS, you must first register the task definition and then create a service in your ECS cluster.

#### Register the Task Definition

Before deploying Shraga on ECS, ensure the task definition is registered with your AWS account.

Create a file called `shraga-task.json`:

```json
{
  "family": "shraga-app",
  "containerDefinitions": [
    {
      "name": "shraga-app",
      "image": "r.bigdataboutique.com/shraga:latest",
      "cpu": 1024,
      "memory": 2048,
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
- `/path/to/your/config.yaml` – Path to your Shraga configuration file.

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

The `config.yaml` file will be mounted from the host path `/path/to/your/config.yaml` into the container at `/config/config.yaml`.

### Shraga Configuration

Ensure that your `config.yaml` file is placed at the appropriate location (`/path/to/your/config.yaml`) before deploying to either Kubernetes or ECS. This file will be mounted into the container and used based on the `CONFIG_PATH` environment variable.
