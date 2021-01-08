## Deploy

```sh
IMAGE="gcr.io/stardust-skyhook/receiver:$TAG"
docker build . -t $IMAGE
docker push $IMAGE
gcloud alpha run services update receiver --platform=managed --project=stardust-skyhook --region=us-central1 --image=$IMAGE

# or

# update tag in cloud-run.yaml
gcloud alpha run services replace cloud-run.yaml --platform=managed
```
