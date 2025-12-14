import boto3
import os
import uuid
import logging
from botocore.exceptions import NoCredentialsError

logger = logging.getLogger(__name__)

ALLOWED_GAMES = {"pubg", "csgo", "valorant", "lol"}

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
)

BUCKET = os.getenv("AWS_S3_BUCKET_NAME")
REGION = os.getenv("AWS_REGION")


def upload_video_to_s3(file, in_game_id: str, game: str) -> str:
    try:
        game = game.lower().strip()
        if game not in ALLOWED_GAMES:
            raise ValueError("Invalid game")

        # Safe extension handling
        ext = file.filename.rsplit(".", 1)[-1].lower()
        key = f"{game}/{in_game_id}/{uuid.uuid4()}.{ext}"

        s3.upload_fileobj(
            file,
            BUCKET,
            key,
            ExtraArgs={
                "ContentType": file.content_type,
            }
        )

        url = f"https://{BUCKET}.s3.{REGION}.amazonaws.com/{key}"
        logger.info(f"Uploaded video to S3: {url}")
        return url

    except NoCredentialsError:
        logger.error("AWS credentials not found")
        raise

    except Exception as e:
        logger.error(f"S3 upload failed: {str(e)}")
        raise
