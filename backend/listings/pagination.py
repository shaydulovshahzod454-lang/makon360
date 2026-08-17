from rest_framework.pagination import PageNumberPagination


class StandardResultsPagination(PageNumberPagination):
    """Standart pagination - lekin frontend `page_size` parametri orqali
    (masalan bosh sahifada faqat 6 tasini so'rash uchun) buni o'zgartirishi mumkin."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 50