# payments/serializers.py
from rest_framework import serializers
from .models import Payment
from farmers.serializers import FarmerSerializer
from farmers.models import Farmer

class PaymentSerializer(serializers.ModelSerializer):
    # Nested read-only farmer info
    farmer = FarmerSerializer(read_only=True)
    # Write-only FK for create/update
    farmer_id = serializers.PrimaryKeyRelatedField(
        queryset=Farmer.objects.all(),
        source='farmer',
        write_only=True
    )
    # Read-only display of who recorded/verified
    recorded_by = serializers.StringRelatedField(read_only=True)
    verified_by = serializers.StringRelatedField(read_only=True)
    # Attachments
    attachment_url = serializers.SerializerMethodField()
    # NEW: total amount due (plots × amount_per_plot)
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id',
            'farmer', 'farmer_id',
            'total_amount',            # ← new field
            'amount', 'payment_type',
            'description', 'date_paid',
            'method', 'reference_code',
            'attachment', 'attachment_url',
            'recorded_by', 'timestamp',
            'is_verified', 'verified_by',
            'verification_date', 'notes',
        ]
        read_only_fields = [
            'recorded_by', 'timestamp',
            'verified_by', 'verification_date',
            'total_amount',             # ensure read-only
        ]
        extra_kwargs = {
            'attachment': {'required': False, 'allow_null': True},
            'reference_code': {'required': False, 'allow_null': True},
        }

    def get_attachment_url(self, obj):
        if obj.attachment:
            return self.context['request'].build_absolute_uri(obj.attachment.url)
        return None

    def get_total_amount(self, obj):
        """
        Compute farmer.total_amount (plots * amount_per_plot).
        If farmer has no such attributes, return None.
        """
        farmer = getattr(obj, 'farmer', None)
        if not farmer:
            return None
        try:
            # assuming your Farmer model has number_of_plots & amount_per_plot
            return float(farmer.number_of_plots) * float(farmer.amount_per_plot)
        except Exception:
            return None

    def validate(self, data):
        # enforce description when type is 'fine'
        if data.get('payment_type') == 'fine' and not data.get('description'):
            raise serializers.ValidationError("Description is required for fines")
        return data

    def create(self, validated_data):
        # auto-stamp recorded_by from request.user
        validated_data['recorded_by'] = self.context['request'].user
        return super().create(validated_data)
