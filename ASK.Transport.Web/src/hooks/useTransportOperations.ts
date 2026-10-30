import { useState, useEffect, useCallback } from 'react';
import type { 
  TruckTyreFleetRecord, 
  TyreItem, 
  DockBayStatus, 
  GatePassRecord, 
  WeighbridgeSlipRecord, 
  FreightCorridorIndex, 
  SpotBrokerBid 
} from '../types/transportOperations';
import * as tyreApi from '../api/tyreApi';
import * as dockYardApi from '../api/dockYardApi';
import * as weighbridgeApi from '../api/weighbridgeApi';
import * as spotFreightApi from '../api/spotFreightApi';

// ============================================================================
// 1. TYRE & TPMS HOOK
// ============================================================================
export function useTyreLifecycle() {
  const [fleet, setFleet] = useState<TruckTyreFleetRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFleet = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tyreApi.getFleetTyres();
      setFleet(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load fleet tyre telematics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFleet();
  }, [fetchFleet]);

  const inflateTyre = async (plateNo: string, tyreId: string, psi = 118): Promise<TyreItem | null> => {
    try {
      const updated = await tyreApi.inflateTyre(plateNo, tyreId, psi);
      await fetchFleet();
      return updated;
    } catch {
      return null;
    }
  };

  const retreadTyre = async (plateNo: string, tyreId: string): Promise<TyreItem | null> => {
    try {
      const updated = await tyreApi.sendTyreForColdRetread(plateNo, tyreId);
      await fetchFleet();
      return updated;
    } catch {
      return null;
    }
  };

  return { fleet, loading, error, refresh: fetchFleet, inflateTyre, retreadTyre };
}

// ============================================================================
// 2. DOCK YARD & GATE PASS HOOK
// ============================================================================
export function useDockYard() {
  const [bays, setBays] = useState<DockBayStatus[]>([]);
  const [passes, setPasses] = useState<GatePassRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [b, p] = await Promise.all([
        dockYardApi.getDockBays(),
        dockYardApi.getGatePasses()
      ]);
      setBays(b);
      setPasses(p);
    } catch (err) {
      console.warn('Dock yard offline fallback:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const generateGateIn = async (record: Partial<GatePassRecord>) => {
    const created = await dockYardApi.generateGateInPass(record);
    await loadAll();
    return created;
  };

  const expediteDock = async (passId: string) => {
    const exp = await dockYardApi.expediteDockLoading(passId);
    await loadAll();
    return exp;
  };

  const gateOut = async (passId: string) => {
    const out = await dockYardApi.authorizeGateOut(passId);
    await loadAll();
    return out;
  };

  return { bays, passes, loading, refresh: loadAll, generateGateIn, expediteDock, gateOut };
}

// ============================================================================
// 3. ELECTRONIC WEIGHBRIDGE HOOK
// ============================================================================
export function useElectronicWeighbridge() {
  const [slips, setSlips] = useState<WeighbridgeSlipRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadSlips = useCallback(async () => {
    try {
      setLoading(true);
      const data = await weighbridgeApi.getWeighbridgeSlips();
      setSlips(data);
    } catch (err) {
      console.warn('Weighbridge offline fallback:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlips();
  }, [loadSlips]);

  const authorizeCrossDock = async (slipId: string) => {
    const updated = await weighbridgeApi.authorizeCrossDockDeLoad(slipId);
    await loadSlips();
    return updated;
  };

  return { slips, loading, refresh: loadSlips, authorizeCrossDock };
}

// ============================================================================
// 4. SPOT FREIGHT & REVERSE BIDDING HOOK
// ============================================================================
export function useSpotFreightRate() {
  const [corridors, setCorridors] = useState<FreightCorridorIndex[]>([]);
  const [bids, setBids] = useState<SpotBrokerBid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [c, b] = await Promise.all([
        spotFreightApi.getFreightCorridors(),
        spotFreightApi.getBrokerBids()
      ]);
      setCorridors(c);
      setBids(b);
    } catch (err) {
      console.warn('Spot freight offline fallback:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const acceptBid = async (bidId: string) => {
    const accepted = await spotFreightApi.acceptBrokerBid(bidId);
    await loadData();
    return accepted;
  };

  const broadcastLoad = async (lane: string, tonnage: number, rate: number) => {
    const success = await spotFreightApi.broadcastLoadRequirement(lane, tonnage, rate);
    await loadData();
    return success;
  };

  return { corridors, bids, loading, refresh: loadData, acceptBid, broadcastLoad };
}
