import { useState, useEffect } from 'react';
import api from '../services/api';

export const useLeads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [leadStats, setLeadStats] = useState(null);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await api.get('/crm/leads/');
            setLeads(response.data);
            
            // Calculate stats
            const stats = {
                total: response.data.length,
                new: response.data.filter(l => l.status === 'new').length,
                contacted: response.data.filter(l => l.status === 'contacted').length,
                qualified: response.data.filter(l => l.status === 'qualified').length,
                converted: response.data.filter(l => l.status === 'converted').length,
                lost: response.data.filter(l => l.status === 'lost').length,
            };
            setLeadStats(stats);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createLead = async (leadData) => {
        try {
            const response = await api.post('/crm/leads/', leadData);
            setLeads(prev => [...prev, response.data]);
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const updateLead = async (id, leadData) => {
        try {
            const response = await api.put(`/crm/leads/${id}/`, leadData);
            setLeads(prev => prev.map(lead => lead.id === id ? response.data : lead));
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const deleteLead = async (id) => {
        try {
            await api.delete(`/crm/leads/${id}/`);
            setLeads(prev => prev.filter(lead => lead.id !== id));
        } catch (err) {
            throw err;
        }
    };

    const convertLeadToContact = async (id) => {
        try {
            const response = await api.post(`/crm/leads/${id}/convert_to_contact/`);
            setLeads(prev => prev.map(lead => lead.id === id ? response.data : lead));
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    return {
        leads,
        loading,
        error,
        leadStats,
        refresh: fetchLeads,
        createLead,
        updateLead,
        deleteLead,
        convertLeadToContact
    };
};

export const useContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [contactStats, setContactStats] = useState(null);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/crm/contacts/');
            setContacts(response.data);
            
            const stats = {
                total: response.data.length,
                primary: response.data.filter(c => c.is_primary).length,
                decisionMakers: response.data.filter(c => c.is_decision_maker).length,
                byDepartment: response.data.reduce((acc, contact) => {
                    const dept = contact.department || 'Unassigned';
                    acc[dept] = (acc[dept] || 0) + 1;
                    return acc;
                }, {})
            };
            setContactStats(stats);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createContact = async (contactData) => {
        try {
            const response = await api.post('/crm/contacts/', contactData);
            setContacts(prev => [...prev, response.data]);
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const updateContact = async (id, contactData) => {
        try {
            const response = await api.put(`/crm/contacts/${id}/`, contactData);
            setContacts(prev => prev.map(contact => contact.id === id ? response.data : contact));
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const deleteContact = async (id) => {
        try {
            await api.delete(`/crm/contacts/${id}/`);
            setContacts(prev => prev.filter(contact => contact.id !== id));
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    return {
        contacts,
        loading,
        error,
        contactStats,
        refresh: fetchContacts,
        createContact,
        updateContact,
        deleteContact
    };
};

export const useAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accountStats, setAccountStats] = useState(null);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/crm/accounts/');
            setAccounts(response.data);
            
            const stats = {
                total: response.data.length,
                byType: response.data.reduce((acc, account) => {
                    acc[account.account_type] = (acc[account.account_type] || 0) + 1;
                    return acc;
                }, {}),
                byRating: response.data.reduce((acc, account) => {
                    acc[account.rating] = (acc[account.rating] || 0) + 1;
                    return acc;
                }, {}),
                totalRevenue: response.data.reduce((sum, account) => sum + (account.annual_revenue || 0), 0)
            };
            setAccountStats(stats);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createAccount = async (accountData) => {
        try {
            const response = await api.post('/crm/accounts/', accountData);
            setAccounts(prev => [...prev, response.data]);
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const updateAccount = async (id, accountData) => {
        try {
            const response = await api.put(`/crm/accounts/${id}/`, accountData);
            setAccounts(prev => prev.map(account => account.id === id ? response.data : account));
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const deleteAccount = async (id) => {
        try {
            await api.delete(`/crm/accounts/${id}/`);
            setAccounts(prev => prev.filter(account => account.id !== id));
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    return {
        accounts,
        loading,
        error,
        accountStats,
        refresh: fetchAccounts,
        createAccount,
        updateAccount,
        deleteAccount
    };
};

export const useOpportunities = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [opportunityStats, setOpportunityStats] = useState(null);

    const fetchOpportunities = async () => {
        try {
            setLoading(true);
            const response = await api.get('/crm/opportunities/');
            setOpportunities(response.data);
            
            const openOpportunities = response.data.filter(o => !o.stage.includes('closed'));
            const closedWon = response.data.filter(o => o.stage === 'closed_won');
            const totalValue = openOpportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);
            
            const stats = {
                total: response.data.length,
                open: openOpportunities.length,
                won: closedWon.length,
                value: totalValue,
                averageDealSize: closedWon.length > 0 ? closedWon.reduce((sum, opp) => sum + (opp.amount || 0), 0) / closedWon.length : 0,
                byStage: response.data.reduce((acc, opp) => {
                    acc[opp.stage] = (acc[opp.stage] || 0) + 1;
                    return acc;
                }, {}),
                averageCycle: 45 // This would be calculated based on actual data
            };
            setOpportunityStats(stats);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createOpportunity = async (opportunityData) => {
        try {
            const response = await api.post('/crm/opportunities/', opportunityData);
            setOpportunities(prev => [...prev, response.data]);
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const updateOpportunity = async (id, opportunityData) => {
        try {
            const response = await api.put(`/crm/opportunities/${id}/`, opportunityData);
            setOpportunities(prev => prev.map(opp => opp.id === id ? response.data : opp));
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const deleteOpportunity = async (id) => {
        try {
            await api.delete(`/crm/opportunities/${id}/`);
            setOpportunities(prev => prev.filter(opp => opp.id !== id));
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        fetchOpportunities();
    }, []);

    return {
        opportunities,
        loading,
        error,
        opportunityStats,
        refresh: fetchOpportunities,
        createOpportunity,
        updateOpportunity,
        deleteOpportunity
    };
};

export const useActivities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const response = await api.get('/crm/activities/');
            setActivities(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createActivity = async (activityData) => {
        try {
            const response = await api.post('/crm/activities/', activityData);
            setActivities(prev => [...prev, response.data]);
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const updateActivity = async (id, activityData) => {
        try {
            const response = await api.put(`/crm/activities/${id}/`, activityData);
            setActivities(prev => prev.map(activity => activity.id === id ? response.data : activity));
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const deleteActivity = async (id) => {
        try {
            await api.delete(`/crm/activities/${id}/`);
            setActivities(prev => prev.filter(activity => activity.id !== id));
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    return {
        activities,
        loading,
        error,
        refresh: fetchActivities,
        createActivity,
        updateActivity,
        deleteActivity
    };
};

export const useCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const response = await api.get('/crm/campaigns/');
            setCampaigns(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createCampaign = async (campaignData) => {
        try {
            const response = await api.post('/crm/campaigns/', campaignData);
            setCampaigns(prev => [...prev, response.data]);
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const updateCampaign = async (id, campaignData) => {
        try {
            const response = await api.put(`/crm/campaigns/${id}/`, campaignData);
            setCampaigns(prev => prev.map(campaign => campaign.id === id ? response.data : campaign));
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const deleteCampaign = async (id) => {
        try {
            await api.delete(`/crm/campaigns/${id}/`);
            setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    return {
        campaigns,
        loading,
        error,
        refresh: fetchCampaigns,
        createCampaign,
        updateCampaign,
        deleteCampaign
    };
};