from app.models.email_account import EmailAccount
from app.repositories.base import BaseRepository


class EmailAccountRepository(BaseRepository[EmailAccount]):
    pass


email_account_repo = EmailAccountRepository(EmailAccount)
