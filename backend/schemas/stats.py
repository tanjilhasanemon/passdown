from pydantic import BaseModel


class ContributionStatusCounts(BaseModel):
    pending: int = 0
    approved: int = 0
    rejected: int = 0


class RequestStatusCounts(BaseModel):
    open: int = 0
    fulfilled: int = 0


class UserSummaryRead(BaseModel):
    contributions: ContributionStatusCounts
    requests: RequestStatusCounts


class PlatformStatsRead(BaseModel):
    users: int = 0
    courses: int = 0
    core_materials: int = 0
    contributions: ContributionStatusCounts
    requests: RequestStatusCounts
