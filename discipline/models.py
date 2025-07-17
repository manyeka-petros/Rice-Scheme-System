from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from farmers.models import Farmer, Block, Section

User = get_user_model()


class DisciplineCase(models.Model):
    """Model to track disciplinary cases for farmers."""

    OFFENCE_CHOICES = [
        ("absence", "Absence"),
        ("lateness", "Lateness"),
        ("violence", "Violence"),
        ("theft", "Theft"),
        ("vandalism", "Vandalism"),
        ("non_compliance", "Non-compliance"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("open", "Open"),
        ("investigating", "Investigating"),
        ("hearing_scheduled", "Hearing Scheduled"),
        ("resolved", "Resolved"),
        ("closed", "Closed"),
        ("appealed", "Appealed"),
    ]

    SEVERITY_CHOICES = [
        ("minor", "Minor"),
        ("moderate", "Moderate"),
        ("serious", "Serious"),
        ("critical", "Critical"),
    ]

    farmer = models.ForeignKey(
        Farmer, on_delete=models.CASCADE, related_name="discipline_cases"
    )
    block = models.ForeignKey(
        Block, on_delete=models.SET_NULL, null=True, blank=True
    )
    section = models.ForeignKey(
        Section, on_delete=models.SET_NULL, null=True, blank=True
    )

    date_reported = models.DateTimeField(
        default=timezone.now, verbose_name="Date Reported"
    )
    date_incident = models.DateField(
        null=True, blank=True, verbose_name="Date of Incident"
    )

    offence_type = models.CharField(
        max_length=20, choices=OFFENCE_CHOICES, verbose_name="Offence Type"
    )
    offence_description = models.TextField(verbose_name="Offence Description")
    action_taken = models.TextField(blank=True, verbose_name="Action Taken")

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="open"
    )
    severity = models.CharField(
        max_length=10, choices=SEVERITY_CHOICES, default="moderate"
    )
    penalty_points = models.PositiveIntegerField(default=0)
    comment = models.TextField(blank=True)

    reported_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="reported_cases",
        verbose_name="Reported By",
    )
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_cases",
        verbose_name="Resolved By",
    )
    resolution_date = models.DateTimeField(null=True, blank=True)

    attachment = models.FileField(
        upload_to="discipline_attachments/", null=True, blank=True
    )
    evidence = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ['-date_reported']
        verbose_name = "Discipline Case"
        verbose_name_plural = "Discipline Cases"
        permissions = [
            ("can_escalate_case", "Can escalate case severity"),
            ("can_resolve_case", "Can resolve cases"),
        ]

    def save(self, *args, **kwargs):
        """Auto-populate block/section from farmer and set resolution date."""
        if self.farmer_id:
            # Only set block/section if not explicitly set
            if not self.block:
                self.block = self.farmer.block
            if not self.section:
                self.section = self.farmer.section

        if self.status == "resolved" and not self.resolution_date:
            self.resolution_date = timezone.now()

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"Case #{self.id}: {self.farmer} - "
            f"{self.get_offence_type_display()} ({self.get_status_display()})"
        )
