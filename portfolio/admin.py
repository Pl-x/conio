from django.contrib import admin
from .models import portfolio


# Register your models here.
class portfolioAdmin(admin.ModelAdmin):
  list_display = ("firstname", "lastname", "joined_date",)

admin.site.register(portfolio)
