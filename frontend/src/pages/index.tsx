import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { FiShoppingCart, FiPackage, FiUsers, FiTrendingUp, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const features = [
    {
      icon: <FiShoppingCart className="w-8 h-8" />,
      title: 'Point of Sale',
      description: 'Fast and efficient checkout with barcode scanning, multiple payment methods, and receipt printing.',
      image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800',
    },
    {
      icon: <FiPackage className="w-8 h-8" />,
      title: 'Inventory Management',
      description: 'Track dimensional products, serial numbers, batches, and manage stock across multiple locations.',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: 'Customer Management',
      description: 'Manage retail, contractor, and corporate accounts with credit facilities and project tracking.',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: 'Reports & Analytics',
      description: 'Comprehensive reporting on sales, inventory, purchases, and business performance.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    },
  ];

  const hardwareFeatures = [
    'Barcode Scanners (1D/2D)',
    'Receipt Printers (ESC/POS)',
    'Digital Weighing Scales',
    'Label Printers',
    'Cash Drawers',
    'Biometric Devices',
  ];

  const benefits = [
    'Cut-to-Size Operations',
    'Tool Rental Management',
    'M-Pesa Integration',
    'Multi-Branch Support',
    'Contractor Credit Management',
    'Serial Number Tracking',
    'Batch/Lot Tracking',
    'Purchase Order Management',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <>
      <Head>
        <title>HARD-POS PRO - Hardware & Building Supplies POS System</title>
        <meta name="description" content="Professional Point of Sale system for hardware stores, building materials suppliers, and tool retailers in Kenya" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                    <FiPackage className="w-6 h-6 text-white" />
                  </div>
                  <span className="ml-3 text-2xl font-bold text-gray-900">HARD-POS PRO</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/login')}
                  className="btn btn-primary"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                  Hardware & Building Supplies
                  <span className="block text-primary-600">POS System</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  The complete solution for hardware stores, building material suppliers, and tool retailers. 
                  Handle dimensional products, serial numbers, contractor accounts, and cut-to-size operations seamlessly.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => router.push('/login')}
                    className="btn btn-primary text-lg px-8 py-3 flex items-center"
                  >
                    Get Started
                    <FiArrowRight className="ml-2" />
                  </button>
                  <button
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn btn-secondary text-lg px-8 py-3"
                  >
                    Learn More
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6 mt-12">
                  <div>
                    <div className="text-3xl font-bold text-primary-600">100%</div>
                    <div className="text-sm text-gray-600">Kenyan Market</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary-600">24/7</div>
                    <div className="text-sm text-gray-600">Support</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary-600">KES</div>
                    <div className="text-sm text-gray-600">M-Pesa Ready</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800"
                    alt="Hardware Store"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600">Today's Sales</div>
                          <div className="text-2xl font-bold text-primary-600">KES 487,250</div>
                        </div>
                        <FiTrendingUp className="w-8 h-8 text-green-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Run Your Hardware Store
              </h2>
              <p className="text-xl text-gray-600">
                Purpose-built for the unique needs of hardware and building supplies retail
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`card cursor-pointer transition-all duration-300 ${
                    activeFeature === index ? 'ring-2 ring-primary-500 shadow-lg' : ''
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={features[activeFeature].image}
                alt={features[activeFeature].title}
                width={1200}
                height={600}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Hardware Integration Section */}
        <div className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Professional Hardware Integration
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Connect seamlessly with industry-standard hardware devices for a complete retail solution.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hardwareFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Image
                  src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800"
                  alt="Hardware Devices"
                  width={800}
                  height={600}
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Built for Hardware Retail
              </h2>
              <p className="text-xl text-gray-600">
                Specialized features for your industry
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="card text-center">
                  <FiCheckCircle className="w-10 h-10 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">{benefit}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-24 bg-primary-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Hardware Store?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join hardware retailers across Kenya who trust HARD-POS PRO
            </p>
            <button
              onClick={() => router.push('/login')}
              className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg font-semibold text-lg inline-flex items-center shadow-lg"
            >
              Get Started Today
              <FiArrowRight className="ml-2" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                    <FiPackage className="w-6 h-6 text-white" />
                  </div>
                  <span className="ml-3 text-xl font-bold">HARD-POS PRO</span>
                </div>
                <p className="text-gray-400">
                  Professional POS system for hardware stores and building supplies retailers.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>Features</li>
                  <li>Pricing</li>
                  <li>Hardware</li>
                  <li>Support</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>About Us</li>
                  <li>Contact</li>
                  <li>Blog</li>
                  <li>Careers</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Contact</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>📧 helvinotechltd@gmail.com</li>
                  <li>📱 0703445756</li>
                  <li>📍 Nairobi, Kenya</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Helvino Technologies Limited. All rights reserved.</p>
              <p className="mt-2 text-sm">Building Reliable Digital Foundation</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
