from django import template
from django.utils.safestring import mark_safe

register = template.Library()

COLOR_SET = {
    "0": "rgb(186 230 253)",
    "1": "rgb(254 205 211)",
    "2": "rgb(245 208 254)",
    "3": "rgb(221 214 254)",
    "4": "rgb(191 219 254)",
    "5": "rgb(204 251 241)",
    "6": "rgb(187 247 208)",
    "7": "rgb(254 249 195)",
    "8": "rgb(186 230 253)",
    "9": "rgb(254 202 202)",
    "A": "rgb(231 229 228)",
    "B": "rgb(226 232 240)",
    "C": "rgb(252 231 243)",
    "D": "rgb(233 213 255)",
    "E": "rgb(199 210 254)",
    "F": "rgb(209 250 229)",
}

# SVG Icons (Tabler Icons, Bootstrap Icons, Phosphor Icons)
ICONS = {
    "📂": '<i class="ti ti-folder-open"></i>',
    "📕": '<i class="ti ti-book-2"></i>',
    "🔋": '<i class="ti ti-battery-charging"></i>',
    "☁": '<i class="ti ti-cloud"></i>',
    "💾": '<i class="ti ti-server-bolt"></i>',
    "🖥": '<i class="ti ti-device-desktop"></i>',
    "📑": '<i class="ti ti-file-zip"></i>',
    "💡": '<i class="ti ti-cpu"></i>',
    "📊": '<i class="ti ti-chart-histogram"></i>',
    "📢": '<i class="ti ti-speakerphone"></i>',
    "⚙": '<i class="ti ti-settings"></i>'
}

@register.simple_tag
def get_category_color(name):
    if not name:
        return COLOR_SET["0"]
    try:
        s = sum(ord(c) for c in name)
        hex_s = hex(s).upper()
        key = hex_s[-1]
        return COLOR_SET.get(key, COLOR_SET["0"])
    except:
        return COLOR_SET["0"]

@register.simple_tag
def get_category_icon(category):
    if not category:
        return {'icon': '', 'text': ''}
    
    parts = category.split(" ")
    emoji = parts[0]
    text = " ".join(parts[1:]) if len(parts) > 1 else ""
    
    icon_svg = ICONS.get(emoji)
    
    if icon_svg:
        return {'icon': mark_safe(icon_svg), 'text': text}
    else:
        return {'icon': emoji, 'text': text}
