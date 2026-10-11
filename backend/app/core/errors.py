class ApiError(Exception):
    """Raise anywhere; main.py turns it into {code, message} JSON the frontend understands."""

    def __init__(self, status: int, code: str, message: str) -> None:
        super().__init__(message)
        self.status, self.code, self.message = status, code, message
