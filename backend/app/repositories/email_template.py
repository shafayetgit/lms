from app.models.email_template import EmailTemplate
from app.repositories.base import BaseRepository


class EmailTemplateRepository(BaseRepository[EmailTemplate]):
    pass


email_template_repo = EmailTemplateRepository(EmailTemplate)
