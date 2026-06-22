from django.db import models


class WeddingConfig(models.Model):
    groom_name = models.CharField(max_length=100, default="Ulug'bek", verbose_name="Kuyov ismi")
    bride_name = models.CharField(max_length=100, default="Malika", verbose_name="Kelin ismi")
    wedding_date = models.DateField(verbose_name="To'y sanasi")
    wedding_time = models.TimeField(verbose_name="Boshlanish vaqti")
    wedding_day_name = models.CharField(max_length=30, default="Chorshanba", verbose_name="Hafta kuni (UZ)")

    ayat_text = models.TextField(
        default='"Va U ularning qalblarini birlashtirdi"',
        verbose_name="Oyat / Iqtibos matni"
    )
    ayat_ref = models.CharField(max_length=60, default="Al-Anfal, 63", verbose_name="Oyat manbasi")
    invite_message = models.TextField(
        default="Sizlarni to'yimizga taklif etishdan juda xursandmiz.",
        verbose_name="Taklif matni"
    )
    invite_sub = models.TextField(
        default="Ushbu quvonchli kunimizni siz bilan birga nishonlashni istaymiz.",
        verbose_name="Taklif qo'shimcha matni"
    )

    venue_name = models.CharField(max_length=200, default='"Baxtiyor" restorani', verbose_name="To'yxona nomi")
    venue_address = models.TextField(
        default="Toshkent viloyati, Qibray tumani, Olmazor ko'chasi, 72",
        verbose_name="Manzil"
    )
    venue_phone = models.CharField(max_length=30, blank=True, verbose_name="To'yxona telefon")

    google_maps_url = models.URLField(blank=True, verbose_name="Google Maps havolasi")
    yandex_maps_url = models.URLField(blank=True, verbose_name="Yandex Xarita havolasi")
    google_maps_embed = models.TextField(
        blank=True,
        verbose_name="Google Maps embed URL (iframe uchun)"
    )

    cover_bg = models.ImageField(
        upload_to='backgrounds/', blank=True, null=True,
        verbose_name="Cover orqa fon rasmi"
    )
    hero_bg = models.ImageField(
        upload_to='backgrounds/', blank=True, null=True,
        verbose_name="Hero orqa fon rasmi"
    )
    invitation_bg = models.ImageField(
        upload_to='backgrounds/', blank=True, null=True,
        verbose_name="Taklif bo'limi orqa fon rasmi"
    )

    class Meta:
        verbose_name = "To'y sozlamalari"
        verbose_name_plural = "To'y sozlamalari"

    def __str__(self):
        return f"{self.groom_name} & {self.bride_name} — {self.wedding_date}"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(
            pk=1,
            defaults={
                'wedding_date': '2026-09-09',
                'wedding_time': '18:00',
            }
        )
        return obj


class GalleryImage(models.Model):
    image = models.ImageField(upload_to='gallery/', verbose_name="Rasm")
    label = models.CharField(max_length=50, blank=True, verbose_name="Yorliq (masalan: EXTERIOR)")
    caption = models.CharField(max_length=100, blank=True, verbose_name="Izoh")
    order = models.PositiveSmallIntegerField(default=0, verbose_name="Tartib")

    class Meta:
        verbose_name = "Galereya rasmi"
        verbose_name_plural = "Galereya rasmlari"
        ordering = ['order']

    def __str__(self):
        return self.label or f"Rasm #{self.pk}"


class ProgramItem(models.Model):
    time = models.CharField(max_length=10, verbose_name="Vaqt (masalan: 18:00)")
    event = models.CharField(max_length=150, verbose_name="Tadbir nomi")
    icon = models.CharField(max_length=10, default="✦", verbose_name="Ikonka (emoji)")
    order = models.PositiveSmallIntegerField(default=0, verbose_name="Tartib")

    class Meta:
        verbose_name = "Dastur bandi"
        verbose_name_plural = "To'y dasturi"
        ordering = ['order']

    def __str__(self):
        return f"{self.time} — {self.event}"


class RSVP(models.Model):
    STATUS_CHOICES = [
        ('yes', "Ha, kelaman"),
        ('no', "Kela olmayman"),
    ]

    name = models.CharField(max_length=150, verbose_name="Ism")
    guest_count = models.PositiveSmallIntegerField(default=1, verbose_name="Mehmonlar soni")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='yes', verbose_name="Javob")
    message = models.TextField(blank=True, verbose_name="Izoh")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "RSVP"
        verbose_name_plural = "RSVPlar"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} — {self.get_status_display()}"
