from pydantic import BaseModel, ConfigDict


class PublicStats(BaseModel):
    model_config = ConfigDict(extra="forbid")

    members_joined: int
