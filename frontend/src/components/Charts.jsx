import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export const PALETTE = ['#F97316', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#EAB308', '#22C55E', '#9CA3AF'];

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export const monthLabel = (ym) => MONTHS_ID[Number(ym.split('-')[1]) - 1];

const nf1 = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
const nf0 = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

export function LineSummary({ series }) {
  const data = {
    labels: series.map((s) => monthLabel(s.month)),
    datasets: [
      {
        label: 'Pemasukan',
        data: series.map((s) => s.income),
        borderColor: '#16A34A',
        backgroundColor: 'rgba(22,163,74,0.08)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
      {
        label: 'Pengeluaran',
        data: series.map((s) => s.expense),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239,68,68,0.08)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true } } },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 1_000_000,
        ticks: {
          callback: (v) => (v >= 1_000_000 ? `${nf1.format(v / 1_000_000)}jt` : nf0.format(v)),
        },
      },
      x: { grid: { display: false } },
    },
  };
  return <Line data={data} options={options} />;
}

export function DonutByCategory({ items, total }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const data = {
    labels: items.map((i) => i.name),
    datasets: [
      {
        data: items.map((i) => i.total),
        backgroundColor: PALETTE,
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };
  const centerText = {
    id: 'centerText',
    afterDraw(chart) {
      if (chart.config.type !== 'doughnut') return;
      const meta = chart.getDatasetMeta(0);
      if (!meta.data[0]) return;
      const { x, y } = meta.data[0];
      const { ctx } = chart;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '500 11px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText('Total', x, y - 11);
      ctx.font = '700 15px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#111827';
      ctx.fillText(
        `Rp ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(total)}`,
        x,
        y + 9
      );
      ctx.restore();
    },
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { position: isMobile ? 'bottom' : 'right', labels: { boxWidth: 10, usePointStyle: true } },
      tooltip: { enabled: true },
    },
  };
  return (
    <div className="h-full">
      <Doughnut data={data} options={options} plugins={[centerText]} />
    </div>
  );
}
