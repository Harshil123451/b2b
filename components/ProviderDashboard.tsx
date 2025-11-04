/**
 * Provider Dashboard Component
 * Allows providers to:
 * - View open service requests from clients
 * - Submit offers for requests
 * - Manage their submitted offers
 */

'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import { supabase, Database } from '@/lib/supabase';
import ToastContainer, { useToast } from './ToastContainer';

type Request = Database['public']['Tables']['requests']['Row'] & {
  client_name?: string;
};
type Offer = Database['public']['Tables']['offers']['Row'];

interface ProviderDashboardProps {
  userName: string;
}

export default function ProviderDashboard({ userName }: ProviderDashboardProps) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [myOffers, setMyOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  // Form state for submitting offer
  const [price, setPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadRequests();
    loadMyOffers();
  }, []);

  const loadRequests = async () => {
    try {
      // Load all open requests with client names
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Load client names
      const clientIds = requestsData?.map((r) => r.user_id) || [];
      if (clientIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name')
          .in('id', clientIds);

        const requestsWithNames: Request[] = (requestsData || []).map((request) => {
          const client = usersData?.find((u) => u.id === request.user_id);
          return {
            ...request,
            client_name: client?.name || 'Unknown',
          };
        });

        setRequests(requestsWithNames);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyOffers = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyOffers(data || []);
    } catch (error) {
      console.error('Error loading offers:', error);
    }
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (!price || !deliveryTime || !message.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const priceNum = parseFloat(price);
    const deliveryNum = parseInt(deliveryTime);

    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }

    if (isNaN(deliveryNum) || deliveryNum < 1) {
      showToast('Please enter a valid delivery time (at least 1 day)', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('offers').insert({
        request_id: selectedRequest,
        provider_id: user.id,
        price: priceNum,
        delivery_time: deliveryNum,
        message: message.trim(),
      });

      if (error) throw error;

      // Reset form
      setPrice('');
      setDeliveryTime('');
      setMessage('');
      setShowOfferForm(false);
      setSelectedRequest(null);
      showToast('Offer submitted successfully!', 'success');
      loadMyOffers();
      loadRequests();
    } catch (error: any) {
      console.error('Error submitting offer:', error);
      showToast(error.message || 'Failed to submit offer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateOffer = async (offerId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status })
        .eq('id', offerId);

      if (error) throw error;
      
      showToast(`Offer marked as ${status}`, 'success');
      loadMyOffers();
    } catch (error: any) {
      console.error('Error updating offer:', error);
      showToast(error.message || 'Failed to update offer', 'error');
    }
  };

  const getRequestById = (requestId: string) => {
    return requests.find((r) => r.id === requestId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar userName={userName} userRole="provider" />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalRequests = requests.length;
  const myOffersCount = myOffers.length;
  const pendingOffers = myOffers.filter((o) => o.status === 'pending').length;
  const acceptedOffers = myOffers.filter((o) => o.status === 'accepted').length;
  const totalRevenue = myOffers
    .filter((o) => o.status === 'accepted')
    .reduce((sum, o) => sum + o.price, 0);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Sidebar userName={userName} userRole="provider" />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <DashboardHeader
            title="Provider Dashboard"
            subtitle="View open requests and submit competitive offers"
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Open Requests</span>
                <span className="text-2xl">🔍</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{totalRequests}</div>
              <div className="text-xs text-gray-500 mt-1">Available</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">My Offers</span>
                <span className="text-2xl">📤</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">{myOffersCount}</div>
              <div className="text-xs text-gray-500 mt-1">Submitted</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Pending</span>
                <span className="text-2xl">⏳</span>
              </div>
              <div className="text-3xl font-bold text-yellow-600">{pendingOffers}</div>
              <div className="text-xs text-gray-500 mt-1">Awaiting</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Total Revenue</span>
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                ${totalRevenue.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Accepted offers</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Open Requests Section */}
            <div>
              <h2 id="requests" className="text-2xl font-bold mb-6 text-gray-900">Open Requests</h2>
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-gray-700 font-semibold mb-2 text-lg">No open requests</p>
                  <p className="text-gray-500">Check back soon for new service requests from clients!</p>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.id}
                    className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-l-4 border-blue-500 border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-gray-900 text-xl">{request.service_type}</h3>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block font-medium">Client:</span>
                        <span className="text-sm font-semibold text-gray-700">{request.client_name}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-5 line-clamp-3 leading-relaxed">
                      {request.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedRequest(request.id);
                          setShowOfferForm(true);
                        }}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                      >
                        💼 Submit Offer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

            {/* My Offers Section */}
            <div>
              <h2 id="offers" className="text-2xl font-bold mb-6 text-gray-900">My Offers</h2>
            <div className="space-y-4">
              {myOffers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
                  <div className="text-5xl mb-4">📤</div>
                  <p className="text-gray-700 font-semibold mb-2 text-lg">No offers submitted</p>
                  <p className="text-gray-500">Start submitting offers for open requests!</p>
                </div>
              ) : (
                myOffers.map((offer) => {
                  const request = getRequestById(offer.request_id);
                  return (
                    <div key={offer.id} className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {request?.service_type || 'Unknown Request'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 mb-2 line-clamp-2">{offer.message}</p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500 mt-2">
                            <span>📅 {offer.delivery_time} days</span>
                            <span>•</span>
                            <span>{new Date(offer.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-blue-600">
                            ${offer.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <span
                          className={`px-3 py-1 text-xs rounded font-medium ${
                            offer.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : offer.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {offer.status.toUpperCase()}
                        </span>
                        {offer.status === 'pending' && (
                          <div className="space-x-2">
                            <button
                              onClick={() => handleUpdateOffer(offer.id, 'accepted')}
                              className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1 hover:bg-green-50 rounded"
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => handleUpdateOffer(offer.id, 'rejected')}
                              className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded"
                            >
                              ✕ Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          </div>

          {/* Offer Submission Modal */}
        {showOfferForm && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Submit Offer</h2>
              {getRequestById(selectedRequest) && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="font-bold text-gray-900">{getRequestById(selectedRequest)?.service_type}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {getRequestById(selectedRequest)?.description}
                  </p>
                </div>
              )}
              <form onSubmit={handleSubmitOffer} className="space-y-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label
                    htmlFor="deliveryTime"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Delivery Time (days)
                  </label>
                  <input
                    id="deliveryTime"
                    type="number"
                    min="1"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="7"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of your offer..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Offer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOfferForm(false);
                      setSelectedRequest(null);
                      setPrice('');
                      setDeliveryTime('');
                      setMessage('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

