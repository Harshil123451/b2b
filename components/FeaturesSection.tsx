/**
 * Features Section Component
 * Highlights key platform features
 */

'use client';

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    id: '1',
    icon: '⚡',
    title: 'Real-time Updates',
    description: 'Get instant notifications when new offers arrive for your requests',
  },
  {
    id: '2',
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Your data is encrypted and protected with enterprise-grade security',
  },
  {
    id: '3',
    icon: '📊',
    title: 'Advanced Analytics',
    description: 'Compare offers side-by-side with powerful filtering and sorting tools',
  },
  {
    id: '4',
    icon: '🌐',
    title: 'Global Reach',
    description: 'Connect with providers worldwide, expanding your service options',
  },
  {
    id: '5',
    icon: '💼',
    title: 'Easy Management',
    description: 'Manage all your requests and offers from one intuitive dashboard',
  },
  {
    id: '6',
    icon: '🚀',
    title: 'Fast Setup',
    description: 'Get started in minutes with no complex integrations required',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need to compare prices
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you make the best procurement decisions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all hover:border-blue-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

