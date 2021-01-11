# Amazon SES mail receiving

Receiving-enabled regions are `us-east-1`, `us-west-2`, or `eu-west-1` as of writing.
Check updated region list here: https://docs.aws.amazon.com/general/latest/gr/ses.html

## Components

1. SES domain validation
1. DNS TXT and MX records created in provider
1. S3 bucket with attached policy (can be cross region), public block, SSE-S3, and probably versioning
1. SNS topic with skyhook subscribed as HTTPS w/ raw delivery
1. SES rule matching domain and sending to S3 bucket with SNS topic as post-save notif

## S3 bucket policy

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowSESPuts",
            "Effect": "Allow",
            "Principal": {
                "Service": "ses.amazonaws.com"
            },
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::"$BUCKET"/*",
            "Condition": {
                "StringEquals": {
                    "aws:Referer": $ACCOUNT
                }
            }
        }
    ]
}
```
