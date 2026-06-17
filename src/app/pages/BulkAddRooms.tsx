import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Save,
  PersonStanding,
  Users,
  Hotel,
  Building,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  DoorOpen
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FormField, Badge } from '../../components/Modal';
import { adminService } from '../../services/adminService';
import { useToast } from '../components/Toast';

interface PGOption {
  _id: string;
  name: string;
  ownerId?: string | { _id: string; name?: string };
  city?: string;
}

interface RoomTypeConfig {
  value: string;
  label: string;
  icon: React.ElementType;
  beds: number;
  description: string;
}

interface BulkFormState {
  count: number;
  rentPerBed: string;
  floor: string;
}

const roomTypes: RoomTypeConfig[] = [
  { value: 'single', label: 'Single Sharing', icon: PersonStanding, beds: 1, description: '1 bed per room' },
  { value: 'double', label: 'Double Sharing', icon: Users, beds: 2, description: '2 beds per room' },
  { value: 'triple', label: 'Triple Sharing', icon: Hotel, beds: 3, description: '3 beds per room' },
  { value: 'four', label: '4 Sharing', icon: Building, beds: 4, description: '4 beds per room' },
];

const initialBulkForm: Record<string, BulkFormState> = {
  single: { count: 0, rentPerBed: '', floor: '1' },
  double: { count: 0, rentPerBed: '', floor: '1' },
  triple: { count: 0, rentPerBed: '', floor: '1' },
  four: { count: 0, rentPerBed: '', floor: '1' },
};

export function BulkAddRooms() {
  const { showToast } = useToast();
  const [pgs, setPgs] = useState<PGOption[]>([]);
  const [selectedPgId, setSelectedPgId] = useState('');
  const [bulkForm, setBulkForm] = useState(initialBulkForm);
  const [existingRooms, setExistingRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingPGs, setFetchingPGs] = useState(true);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchPGs();
  }, []);

  useEffect(() => {
    if (selectedPgId) {
      fetchExistingRooms(selectedPgId);
    } else {
      setExistingRooms([]);
    }
  }, [selectedPgId]);

  const fetchPGs = async () => {
    try {
      setFetchingPGs(true);
      const response = await adminService.getPGs({ limit: 1000 });
      if (response.success) {
        setPgs(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching PGs:', err);
      showToast('error', 'Failed to load PGs');
    } finally {
      setFetchingPGs(false);
    }
  };

  const fetchExistingRooms = async (pgId: string) => {
    try {
      const response = await adminService.getPGById(pgId);
      if (response.success) {
        setExistingRooms(response.data?.rooms || []);
      }
    } catch (err) {
      console.error('Error fetching existing rooms:', err);
    }
  };

  const handleBulkChange = (type: string, field: keyof BulkFormState, value: number | string) => {
    setBulkForm((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
    setFormError('');
    setFormSuccess('');
  };

  const getTotalRooms = () => {
    return Object.values(bulkForm).reduce((acc, r) => acc + (Number(r.count) || 0), 0);
  };

  const getTotalBeds = () => {
    return Object.entries(bulkForm).reduce((acc, [type, data]) => {
      const beds = roomTypes.find((r) => r.value === type)?.beds || 1;
      return acc + (Number(data.count) || 0) * beds;
    }, 0);
  };

  const getTotalRevenue = () => {
    return Object.entries(bulkForm).reduce((acc, [type, data]) => {
      const beds = roomTypes.find((r) => r.value === type)?.beds || 1;
      return acc + (Number(data.count) || 0) * beds * (Number(data.rentPerBed) || 0);
    }, 0);
  };

  const buildPlannedRooms = () => {
    const roomsToCreate: any[] = [];
    const existingNumericRooms = existingRooms
      .map((room) => parseInt(room.roomNumber || room.room_number, 10))
      .filter((num) => Number.isFinite(num));

    const floorMaxSequence: Record<number, number> = {};
    existingNumericRooms.forEach((roomNumber) => {
      const floor = Math.floor(roomNumber / 100);
      const sequence = roomNumber % 100;
      if (!floorMaxSequence[floor] || sequence > floorMaxSequence[floor]) {
        floorMaxSequence[floor] = sequence;
      }
    });

    let globalCounter = existingNumericRooms.length > 0 ? Math.max(...existingNumericRooms) : 100;

    Object.entries(bulkForm).forEach(([type, data]) => {
      const count = Number(data.count) || 0;
      if (count <= 0) return;

      const beds = roomTypes.find((roomType) => roomType.value === type)?.beds || 1;

      for (let i = 0; i < count; i++) {
        const numericFloor = parseInt(data.floor, 10);
        let roomNumber: string;

        if (Number.isFinite(numericFloor) && numericFloor > 0) {
          const currentSequence = floorMaxSequence[numericFloor] || 0;
          const nextSequence = currentSequence + 1;
          floorMaxSequence[numericFloor] = nextSequence;
          roomNumber = String(numericFloor * 100 + nextSequence);
        } else {
          globalCounter += 1;
          roomNumber = String(globalCounter);
        }

        roomsToCreate.push({
          type,
          roomNumber,
          floor: data.floor || String(roomNumber).charAt(0),
          capacity: beds,
          rentPerBed: Number(data.rentPerBed) || 0,
        });
      }
    });

    return roomsToCreate;
  };

  const selectedPG = pgs.find((pg) => pg._id === selectedPgId);
  const ownerId = typeof selectedPG?.ownerId === 'string' ? selectedPG.ownerId : selectedPG?.ownerId?._id;

  const handleSubmit = async () => {
    setFormError('');
    setFormSuccess('');

    if (!selectedPgId) {
      setFormError('Please select a PG');
      return;
    }
    if (!ownerId) {
      setFormError('Selected PG does not have a valid owner');
      return;
    }

    const roomsToCreate = buildPlannedRooms();

    if (roomsToCreate.length === 0) {
      setFormError('Please add at least one room');
      return;
    }

    setLoading(true);
    try {
      const response = await adminService.bulkAddRooms(selectedPgId, ownerId, roomsToCreate);

      if (!response.success) {
        setFormError(response.message || 'Failed to create rooms');
        return;
      }

      const totalCreated = response.totalCreated || roomsToCreate.length;
      const totalErrors = response.totalErrors || 0;

      if (totalErrors > 0) {
        setFormSuccess(`Created ${totalCreated} room(s). ${totalErrors} room(s) failed.`);
        showToast('info', `Created ${totalCreated} room(s). ${totalErrors} failed.`);
      } else {
        setFormSuccess(`Successfully created ${totalCreated} rooms with ${getTotalBeds()} total beds!`);
        showToast('success', `Created ${totalCreated} rooms successfully`);
      }

      // Reset counts but keep rent/floor values for convenience
      setBulkForm((prev) =>
        Object.keys(prev).reduce((acc, key) => {
          acc[key] = { ...prev[key], count: 0 };
          return acc;
        }, {} as Record<string, BulkFormState>)
      );

      fetchExistingRooms(selectedPgId);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to create rooms. Please try again.';
      setFormError(message);
      showToast('error', message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'single':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'double':
        return 'border-cyan-500/30 bg-cyan-500/5';
      case 'triple':
        return 'border-purple-500/30 bg-purple-500/5';
      case 'four':
        return 'border-amber-500/30 bg-amber-500/5';
      default:
        return 'border-border bg-muted/30';
    }
  };

  const plannedRooms = buildPlannedRooms();

  return (
    <div>
      <PageHeader
        title="Bulk Add Rooms"
        description="Quickly add multiple rooms to a selected PG at once"
      />

      {formError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          {formError}
        </motion.div>
      )}

      {formSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          {formSuccess}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6 mb-6"
      >
        <FormField label="Select PG" required>
          <select
            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
            value={selectedPgId}
            onChange={(e) => setSelectedPgId(e.target.value)}
            disabled={fetchingPGs}
          >
            <option value="">{fetchingPGs ? 'Loading PGs...' : 'Select a PG'}</option>
            {pgs.map((pg) => (
              <option key={pg._id} value={pg._id}>
                {pg.name} {pg.city ? `(${pg.city})` : ''}
              </option>
            ))}
          </select>
        </FormField>

        {selectedPG && (
          <div className="p-3 bg-muted/30 rounded-lg text-sm">
            <span className="text-muted-foreground">Owner:</span>{' '}
            <span className="font-medium">
              {typeof selectedPG.ownerId === 'object' ? selectedPG.ownerId?.name || 'Unknown' : selectedPG.ownerId || 'Unknown'}
            </span>
            {existingRooms.length > 0 && (
              <span className="ml-4 text-muted-foreground">
                Existing rooms: <Badge variant="info">{existingRooms.length}</Badge>
              </span>
            )}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-500 flex items-start gap-2"
      >
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Room Number Logic:</strong> Room numbers are floor-based. Floor 1 generates 101, 102… and floor 2
          generates 201, 202… If a floor is not valid, sequential numbers are used starting from the highest existing
          room number.
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {roomTypes.map((type, index) => {
          const Icon = type.icon;
          const hasRooms = (Number(bulkForm[type.value].count) || 0) > 0;

          return (
            <motion.div
              key={type.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={`bg-card/50 backdrop-blur-xl rounded-xl border p-5 transition-all ${
                hasRooms ? getTypeColor(type.value) : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{type.label}</h3>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>
                {hasRooms && (
                  <Badge variant="info">
                    {bulkForm[type.value].count} rooms
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormField label="Count">
                  <input
                    type="number"
                    min={0}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={bulkForm[type.value].count}
                    onChange={(e) => handleBulkChange(type.value, 'count', parseInt(e.target.value) || 0)}
                  />
                </FormField>
                <FormField label="Rent/Bed (₹)">
                  <input
                    type="number"
                    min={0}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={bulkForm[type.value].rentPerBed}
                    onChange={(e) => handleBulkChange(type.value, 'rentPerBed', e.target.value)}
                  />
                </FormField>
                <FormField label="Floor">
                  <input
                    type="number"
                    min={1}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={bulkForm[type.value].floor}
                    onChange={(e) => handleBulkChange(type.value, 'floor', e.target.value)}
                  />
                </FormField>
              </div>

              {hasRooms && (
                <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Beds</p>
                    <p className="font-semibold text-primary">
                      {(Number(bulkForm[type.value].count) || 0) * type.beds}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Per Room</p>
                    <p className="font-semibold">
                      {formatCurrency((Number(bulkForm[type.value].rentPerBed) || 0) * type.beds)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly</p>
                    <p className="font-semibold text-green-500">
                      {formatCurrency(
                        (Number(bulkForm[type.value].count) || 0) *
                          type.beds *
                          (Number(bulkForm[type.value].rentPerBed) || 0)
                      )}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] rounded-xl p-6 mb-6 text-white"
      >
        <h3 className="text-lg font-semibold mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{getTotalRooms()}</p>
            <p className="text-sm text-white/80">Total Rooms</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{getTotalBeds()}</p>
            <p className="text-sm text-white/80">Total Beds</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-amber-300">{formatCurrency(getTotalRevenue())}</p>
            <p className="text-sm text-white/80">Monthly Revenue</p>
          </div>
        </div>
      </motion.div>

      {plannedRooms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6 mb-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <DoorOpen className="w-5 h-5" />
            Room Numbers Preview
          </h3>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {plannedRooms.map((room, index) => (
              <Badge key={`${room.type}-${room.roomNumber}-${index}`} variant="info">
                {room.roomNumber} ({room.capacity} bed{room.capacity > 1 ? 's' : ''})
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-end gap-3"
      >
        <button
          onClick={() => {
            setSelectedPgId('');
            setBulkForm(initialBulkForm);
            setFormError('');
            setFormSuccess('');
          }}
          disabled={loading}
          className="px-6 py-2.5 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50"
        >
          Reset
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || getTotalRooms() === 0 || !selectedPgId}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Create {getTotalRooms()} Rooms
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
