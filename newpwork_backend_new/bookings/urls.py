from django.urls import path
from .views import create_booking, my_bookings, update_booking_status, rate_booking

urlpatterns = [
    path("create/", create_booking, name="create_booking"),
    path("mine/", my_bookings, name="my_bookings"),
    path("<int:booking_id>/status/", update_booking_status, name="update_booking_status"),
    path("<int:booking_id>/rate/", rate_booking, name="rate_booking"),
]

