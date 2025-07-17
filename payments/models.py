# payments/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator

from farmers.models import Farmer

User = get_user_model()

class Payment(models.Model):
    METHOD_CHOICES = [
        ("cash", "Cash"),
        ("airtel", "Airtel Money"),
        ("tnm", "TNM Mpamba"),
        ("bank", "Bank Transfer"),
        ("other", "Other"),
    ]

    PAYMENT_TYPE_CHOICES = [
        ("plot_fee", "Plot Fee"),
        ("fine", "Fine"),
        ("contribution", "Scheme Contribution"),
        ("other", "Other"),
    ]

    farmer = models.ForeignKey(
        Farmer,
        on_delete=models.PROTECT,
        related_name="payments"
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    payment_type = models.CharField(
        max_length=20,
        choices=PAYMENT_TYPE_CHOICES,
        default="plot_fee"
    )
    description = models.CharField(max_length=120)
    date_paid = models.DateField()
    method = models.CharField(
        max_length=10,
        choices=METHOD_CHOICES,
        default="cash"
    )
    reference_code = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )
    attachment = models.FileField(
        upload_to="payment_receipts/%Y/%m/%d/",
        blank=True,
        null=True
    )
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_payments"
    )
    verification_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-date_paid', '-timestamp']
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
        permissions = [
            ("verify_payment", "Can verify payments"),
            ("view_all_payments", "Can view all payments"),
        ]

    def __str__(self):
        return f"Payment #{self.id}: {self.farmer} - {self.amount} ({self.date_paid})"

    def save(self, *args, **kwargs):
        # auto-stamp verification_date when marking verified
        if self.is_verified and not self.verification_date:
            self.verification_date = timezone.now()
        super().save(*args, **kwargs)

    @property
    def total_amount_due(self):
        """
        Read-only: the farmer's total plot fee due as registered:
        number_of_plots * amount_per_plot
        """
        return self.farmer.number_of_plots * self.farmer.amount_per_plot
