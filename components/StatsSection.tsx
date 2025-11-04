/**
 * Statistics Section Component
 * Displays key metrics and achievements
 */

'use client';

interface Stat {
  id: string;
  value: string;
  label: string;
  description?: string;
}

const stats: Stat[] = [
  {
    id: '1',
    value: '10K+',
    label: 'Active Users',
    description: 'Businesses using our platform',
  },
  {
    id: '2',
    value: '50K+',
    label: 'Requests Posted',
    description: 'Service requests processed',
  },
  {
    id: '3',
    value: '30%',
    label: 'Cost Savings',
    description: 'Average savings for clients',
  },
  {
    id: '4',
    value: '99.9%',
    label: 'Uptime',
    description: 'Reliable platform availability',
  },
];

export default function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Numbers that speak for themselves
          </h2>
          <p className="text-blue-100 text-lg">
            Join thousands of businesses optimizing their procurement process
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.id} className="text-center">
              <div className="text-5xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-blue-100 font-semibold text-lg mb-1">{stat.label}</div>
              {stat.description && (
                <div className="text-blue-200 text-sm">{stat.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

