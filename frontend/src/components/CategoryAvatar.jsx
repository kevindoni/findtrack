import {
  Utensils,
  Car,
  GraduationCap,
  ReceiptText,
  Gamepad2,
  ShoppingBag,
  Wallet,
  Coins,
  Laptop,
  Gift,
  Package,
  Tag,
  Zap,
  Wifi,
  Droplets,
  Home,
  PiggyBank,
  Smartphone,
  CreditCard,
  ShieldCheck,
  Fuel,
  Plane,
  Pill,
} from 'lucide-react';

const CATEGORY_RULES = [
  { match: /makanan/i, icon: Utensils, color: '#F97316' },
  { match: /transportasi/i, icon: Car, color: '#3B82F6' },
  { match: /pendidikan/i, icon: GraduationCap, color: '#8B5CF6' },
  { match: /tagihan/i, icon: ReceiptText, color: '#EC4899' },
  { match: /hiburan/i, icon: Gamepad2, color: '#14B8A6' },
  { match: /belanja/i, icon: ShoppingBag, color: '#EAB308' },
  { match: /gaji/i, icon: Wallet, color: '#22C55E' },
  { match: /uang saku/i, icon: Coins, color: '#22C55E' },
  { match: /freelance/i, icon: Laptop, color: '#22C55E' },
  { match: /bonus/i, icon: Gift, color: '#22C55E' },
  { match: /lainnya/i, icon: Package, color: '#9CA3AF' },
];

const KEYWORD_RULES = [
  { match: /listrik|pln|token|lampu/i, icon: Zap, color: '#EAB308' },
  { match: /internet|wifi|wi-fi|indihome/i, icon: Wifi, color: '#3B82F6' },
  { match: /\bair\b|pdam|tagih air/i, icon: Droplets, color: '#0EA5E9' },
  { match: /\bkos\b|sewa|kontrakan|apartemen/i, icon: Home, color: '#F97316' },
  { match: /kuliah|sekolah|spp|\bukt\b|kursus|buku/i, icon: GraduationCap, color: '#8B5CF6' },
  { match: /nabung|tabungan|menabung|deposito/i, icon: PiggyBank, color: '#22C55E' },
  { match: /pulsa|paket data|\bhp\b|handphone|top ?up/i, icon: Smartphone, color: '#14B8A6' },
  { match: /cicilan|angsuran|kredit|pinjaman/i, icon: CreditCard, color: '#6366F1' },
  { match: /asuransi|bpjs|penyakit/i, icon: ShieldCheck, color: '#16A34A' },
  { match: /bensin|pertalite|pertamax|\btol\b|parkir|oli/i, icon: Fuel, color: '#EF4444' },
  { match: /makan|kopi|snack|jajan|nasi|sate/i, icon: Utensils, color: '#F97316' },
  { match: /liburan|travel|pergi|wisata/i, icon: Plane, color: '#0EA5E9' },
  { match: /gaji|gajian|penghasilan/i, icon: Wallet, color: '#22C55E' },
  { match: /obat|dokter|vitamin|konsul/i, icon: Pill, color: '#EC4899' },
  { match: /belanja|shopping/i, icon: ShoppingBag, color: '#EAB308' },
];

const FALLBACK_ICONS = [Tag, ReceiptText, Wallet, ShoppingBag, Utensils, Car, GraduationCap, Package];
const FALLBACK_COLORS = ['#F97316', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#EAB308', '#22C55E', '#9CA3AF'];

function hash(s) {
  let h = 0;
  for (const c of String(s || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function metaFor(text) {
  for (const m of CATEGORY_RULES) {
    if (m.match.test(text || '')) return { icon: m.icon, color: m.color };
  }
  for (const m of KEYWORD_RULES) {
    if (m.match.test(text || '')) return { icon: m.icon, color: m.color };
  }
  const h = hash(text);
  return { icon: FALLBACK_ICONS[h % FALLBACK_ICONS.length], color: FALLBACK_COLORS[h % FALLBACK_COLORS.length] };
}

export default function CategoryAvatar({ name, size = 36 }) {
  const { icon: Icon, color } = metaFor(name);
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full text-white"
      style={{ width: size, height: size, backgroundColor: color }}
      aria-hidden="true"
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={2.2} />
    </span>
  );
}

export function TodoAvatar({ title, size = 36 }) {
  return <CategoryAvatar name={title} size={size} />;
}
