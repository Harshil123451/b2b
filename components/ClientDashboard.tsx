/**
 * Client Dashboard Component
 * Allows clients to:
 * - Create service requests
 * - View all their requests
 * - View and compare offers for each request
 * - Filter offers by price, delivery time, or provider name
 * - Contact providers
 */

'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import { supabase, Database } from '@/lib/supabase';
import ToastContainer, { useToast } from './ToastContainer';

type Request = Database['public']['Tables']['requests']['Row'];
type Offer = Database['public']['Tables']['offers']['Row'] & {
  provider_name?: string;
};

interface ClientDashboardProps {
  userName: string;
}

export default function ClientDashboard({ userName }: ClientDashboardProps) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterPrice, setFilterPrice] = useState<'low' | 'high' | 'none'>('none');
  const [filterDelivery, setFilterDelivery] = useState<'fast' | 'slow' | 'none'>('none');
  const [filterProvider, setFilterProvider] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  // Form state for creating new request
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      loadOffers(selectedRequest);
    }
  }, [selectedRequest]);

  const loadRequests = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOffers = async (requestId: string) => {
    try {
      // Load offers with provider names
      const { data: offersData, error: offersError } = await supabase
        .from('offers')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (offersError) throw offersError;

      // Load provider names
      const providerIds = offersData?.map((o) => o.provider_id) || [];
      if (providerIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name')
          .in('id', providerIds);

        const offersWithNames: Offer[] = (offersData || []).map((offer) => {
          const provider = usersData?.find((u) => u.id === offer.provider_id);
          return {
            ...offer,
            provider_name: provider?.name || 'Unknown',
          };
        });

        setOffers(offersWithNames);
      } else {
        setOffers([]);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceType.trim() || !description.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('requests').insert({
        user_id: user.id,
        service_type: serviceType.trim(),
        description: description.trim(),
      });

      if (error) throw error;

      // Reset form
      setServiceType('');
      setDescription('');
      setShowCreateForm(false);
      showToast('Service request created successfully!', 'success');
      loadRequests();
    } catch (error: any) {
      console.error('Error creating request:', error);
      showToast(error.message || 'Failed to create request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to close this request?')) return;

    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: 'closed' })
        .eq('id', requestId);

      if (error) throw error;

      showToast('Request closed successfully', 'success');
      loadRequests();
      if (selectedRequest === requestId) {
        setSelectedRequest(null);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to close request', 'error');
    }
  };

  const handleAwardRequest = async (requestId: string, offerId: string) => {
    if (!confirm('Award this request to this provider?')) return;

    try {
      // Update request status to awarded
      const { error: requestError } = await supabase
        .from('requests')
        .update({ status: 'awarded' })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Update offer status to accepted
      const { error: offerError } = await supabase
        .from('offers')
        .update({ status: 'accepted' })
        .eq('id', offerId);

      if (offerError) throw offerError;

      showToast('Request awarded successfully!', 'success');
      loadRequests();
      loadOffers(requestId);
    } catch (error: any) {
      showToast(error.message || 'Failed to award request', 'error');
    }
  };

  // Filter offers based on selected filters
  const filteredOffers = offers.filter((offer) => {
    if (filterProvider && !offer.provider_name?.toLowerCase().includes(filterProvider.toLowerCase())) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (filterPrice === 'low') {
      return a.price - b.price;
    } else if (filterPrice === 'high') {
      return b.price - a.price;
    }
    if (filterDelivery === 'fast') {
      return a.delivery_time - b.delivery_time;
    } else if (filterDelivery === 'slow') {
      return b.delivery_time - a.delivery_time;
    }
    return 0;
  });

  const handleContactProvider = async (providerId: string, providerName?: string) => {
    try {
      // Get provider's email from auth
      // Note: We can't directly access auth.users, but we can show a message
      showToast(`Contact information for ${providerName || 'provider'} would be shown here.`, 'info');
      // In a real app, you might want to store contact info in the users table or use a messaging system
    } catch (error) {
      showToast('Unable to retrieve contact information', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar userName={userName} userRole="client" />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your requests...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalRequests = requests.length;
  const openRequests = requests.filter((r) => r.status === 'open').length;
  const totalOffers = offers.length;
  const averagePrice = offers.length > 0
    ? offers.reduce((sum, o) => sum + o.price, 0) / offers.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Sidebar userName={userName} userRole="client" />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <DashboardHeader
            title="Client Dashboard"
            subtitle="Manage your service requests and compare offers from providers"
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Total Requests</span>
                <span className="text-2xl">📋</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{totalRequests}</div>
              <div className="text-xs text-gray-500 mt-1">All time</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Open Requests</span>
                <span className="text-2xl">🔓</span>
              </div>
              <div className="text-3xl font-bold text-green-600">{openRequests}</div>
              <div className="text-xs text-gray-500 mt-1">Active</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Total Offers</span>
                <span className="text-2xl">💼</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{totalOffers}</div>
              <div className="text-xs text-gray-500 mt-1">Received</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Avg. Offer Price</span>
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                ${averagePrice > 0 ? averagePrice.toFixed(2) : '0.00'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Average</div>
            </div>
          </div>

          {/* Create Request Section */}
          <div className="mb-8">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              {showCreateForm ? 'Cancel' : '+ Create New Request'}
            </button>

          {showCreateForm && (
            <div className="mt-6 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Create Service Request</h2>
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div>
                  <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type
                  </label>
                  <input
                    id="serviceType"
                    type="text"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Web Development, Logo Design"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what you need..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Create Request'}
                </button>
              </form>
            </div>
          )}
        </div>

          {/* Requests List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h2 id="requests" className="text-2xl font-bold mb-6 text-gray-900">Your Requests</h2>
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
                  <div className="text-5xl mb-4">📋</div>
                  <p className="text-gray-700 font-semibold mb-2 text-lg">No requests yet</p>
                  <p className="text-gray-500">Create your first service request to get started!</p>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-5 bg-white rounded-xl border transition-all cursor-pointer ${
                      selectedRequest === request.id
                        ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div onClick={() => setSelectedRequest(request.id)}>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-900 text-lg">{request.service_type}</h3>
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-semibold uppercase tracking-wide ${
                            request.status === 'open'
                              ? 'bg-green-100 text-green-700'
                              : request.status === 'awarded'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">{request.description}</p>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400 font-medium">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                        {request.status === 'open' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloseRequest(request.id);
                            }}
                            className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 hover:bg-red-50 rounded"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

            {/* Offers View */}
            <div id="offers" className="lg:col-span-2">
              {selectedRequest ? (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Offers Comparison</h2>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Sort Offers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sort by Price
                      </label>
                      <select
                        value={filterPrice}
                        onChange={(e) => setFilterPrice(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="none">None</option>
                        <option value="low">Low to High</option>
                        <option value="high">High to Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sort by Delivery
                      </label>
                      <select
                        value={filterDelivery}
                        onChange={(e) => setFilterDelivery(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="none">None</option>
                        <option value="fast">Fastest First</option>
                        <option value="slow">Slowest First</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Filter by Provider
                      </label>
                      <input
                        type="text"
                        value={filterProvider}
                        onChange={(e) => setFilterProvider(e.target.value)}
                        placeholder="Provider name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Offers List */}
                <div className="space-y-4">
                  {filteredOffers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                      <div className="text-5xl mb-4">📭</div>
                      <p className="text-gray-700 font-medium mb-2">No offers yet</p>
                      <p className="text-gray-500 text-sm">Providers will see your request and submit offers soon!</p>
                    </div>
                  ) : (
                    filteredOffers.map((offer) => {
                      const selectedRequestData = requests.find((r) => r.id === selectedRequest);
                      return (
                        <div
                          key={offer.id}
                          className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all border-l-4 border-blue-500 border border-gray-100"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {offer.provider_name || 'Provider'}
                                </h3>
                                {offer.status === 'accepted' && (
                                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded font-medium">
                                    Accepted
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1 mb-3">{offer.message}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>📅 {offer.delivery_time} days delivery</span>
                                <span>•</span>
                                <span>{new Date(offer.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-3xl font-bold text-blue-600">
                                ${offer.price.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => handleContactProvider(offer.provider_id, offer.provider_name)}
                              className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                            >
                              💬 Contact Provider
                            </button>
                            {selectedRequestData?.status === 'open' && (
                              <button
                                onClick={() => handleAwardRequest(selectedRequest, offer.id)}
                                className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg"
                              >
                                ✅ Award Request
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-16 text-center border border-gray-100">
                <div className="text-6xl mb-6">👈</div>
                <p className="text-gray-900 font-bold mb-2 text-xl">Select a request</p>
                <p className="text-gray-500">Choose a request from the left to view and compare offers</p>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

