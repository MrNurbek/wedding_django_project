import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from .models import WeddingConfig, GalleryImage, ProgramItem, RSVP


def index(request):
    config = WeddingConfig.get()
    gallery = GalleryImage.objects.all()
    program = ProgramItem.objects.all()
    rsvps = RSVP.objects.all()
    yes_count = sum(r.guest_count for r in rsvps if r.status == 'yes')
    no_count = sum(r.guest_count for r in rsvps if r.status == 'no')

    wedding_date_iso = config.wedding_date.strftime('%Y-%m-%dT') + config.wedding_time.strftime('%H:%M:%S') + '+05:00'

    context = {
        'cfg': config,
        'gallery': gallery,
        'program': program,
        'rsvps': rsvps,
        'yes_count': yes_count,
        'no_count': no_count,
        'total': yes_count + no_count,
        'wedding_date_iso': wedding_date_iso,
    }
    return render(request, 'invitation/index.html', context)


@require_POST
def rsvp_submit(request):
    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        guest_count = int(data.get('guest_count', 1))
        status = data.get('status', 'yes')
        message = data.get('message', '').strip()

        if not name:
            return JsonResponse({'success': False, 'error': 'Ism kiritilishi shart'})

        RSVP.objects.create(
            name=name,
            guest_count=max(1, min(guest_count, 5)),
            status=status,
            message=message,
        )
        rsvps = RSVP.objects.all()
        yes_count = sum(r.guest_count for r in rsvps if r.status == 'yes')
        no_count = sum(r.guest_count for r in rsvps if r.status == 'no')
        return JsonResponse({
            'success': True,
            'total': yes_count + no_count,
            'yes_count': yes_count,
            'no_count': no_count,
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
