from rest_framework import serializers
from .models import Location, Block, Section, Farmer
import logging

logger = logging.getLogger(__name__)

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name']

class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = ['id', 'name']

class SectionSerializer(serializers.ModelSerializer):
    block_name = serializers.CharField(source='block.name', read_only=True)

    class Meta:
        model = Section
        fields = ['id', 'name', 'block', 'block_name']
        extra_kwargs = {
            'block': {'write_only': True}  # Accept block ID on POST/PUT
        }

class FarmerSerializer(serializers.ModelSerializer):
    block_name = serializers.CharField(source='block.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    location_name = serializers.CharField(source='location.name', read_only=True)
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Farmer
        fields = [
            'id', 'first_name', 'last_name', 'middle_name', 'gender',
            'phone_number', 'email', 'registration_number',
            'number_of_plots', 'amount_per_plot', 'total_amount',
            'role', 'location', 'block', 'section', 'date_registered',
            'image',
            'block_name', 'section_name', 'location_name',
        ]
        extra_kwargs = {
            'location': {'write_only': True},  # Accept location ID
            'block': {'write_only': True},     # Accept block ID
            'section': {'write_only': True},   # Accept section ID
            'registration_number': {'read_only': True},
            'date_registered': {'read_only': True},
        }

    def get_total_amount(self, obj):
        try:
            return float(obj.number_of_plots) * float(obj.amount_per_plot)
        except Exception as e:
            logger.error(f"Error calculating total_amount for farmer {obj.id}: {e}")
            return 0.0

    def validate(self, data):
        """Ensure section belongs to selected block"""
        block = data.get('block') or getattr(self.instance, 'block', None)
        section = data.get('section') or getattr(self.instance, 'section', None)

        if block and section and section.block_id != block.id:
            logger.warning(f"Section {section.id} is not part of block {block.id}")
            raise serializers.ValidationError({
                'section': 'This section does not belong to the selected block.'
            })

        return data
