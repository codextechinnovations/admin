import { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Send, Trash2, Download, MapPin } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { adminService } from '../../services/adminService';

interface PGUploadRow {
  row: number;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  type: string;
  image: string;
  link: string;
  city?: string;
  state?: string;
  area?: string;
  pincode?: string;
  status: 'pending' | 'success' | 'error' | 'geocoding';
  error?: string;
}

const sampleCSV = `Name,Address,Phone,Lat,Lng,Type,Image,Link
"Sri om Sai Boys PG Yelahanka","280, 15th A Cross Rd Yelahanka","095916 99009",13.0930136,77.5846083,gents,"https://example.com/image1.jpg","https://maps.google.com/place1"
"Royal paying guest pg mens","27, 1st Main Rd Yelahanka","072045 52872",13.096499,77.5833064,gents,"https://example.com/image2.jpg","https://maps.google.com/place2"
"Aathithya PG","584, 11th B Main Rd","",13.0987609,77.5794166,ladies,"https://example.com/image3.jpg","https://maps.google.com/place3"`;

export function PGCSVUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<PGUploadRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        alert('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('CSV file is empty or has no data rows');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const requiredHeaders = ['Name', 'Address', 'Type'];
      const missingHeaders = requiredHeaders.filter(h => !headers.some(header => header.toLowerCase() === h.toLowerCase()));
      
      if (missingHeaders.length > 0) {
        alert(`Missing required columns: ${missingHeaders.join(', ')}\nRequired: Name, Address, Type`);
        return;
      }

      const data: PGUploadRow[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < 3) continue;

        const getValue = (headerName: string): string => {
          const index = headers.findIndex(h => h.toLowerCase() === headerName.toLowerCase());
          return index >= 0 && index < values.length ? values[index] : '';
        };

        const latStr = getValue('Lat');
        const lngStr = getValue('Lng');

        const row: PGUploadRow = {
          row: i + 1,
          name: getValue('Name'),
          address: getValue('Address'),
          phone: getValue('Phone'),
          lat: latStr ? parseFloat(latStr) : 0,
          lng: lngStr ? parseFloat(lngStr) : 0,
          type: getValue('Type').toLowerCase(),
          image: getValue('Image'),
          link: getValue('Link'),
          status: 'pending'
        };

        const errors: string[] = [];
        if (!row.name) errors.push('Name required');
        if (!row.address) errors.push('Address required');
        if (!row.type) errors.push('Type required');
        
        if (errors.length > 0) {
          row.status = 'error';
          row.error = errors.join(', ');
        }

        data.push(row);
      }

      setParsedData(data);
      setShowPreview(true);
      
      geocodeAllRows(data);
    };
    reader.readAsText(file);
  };

  const geocodeAllRows = async (initialData: PGUploadRow[]) => {
    const rowsWithCoords = initialData.filter(r => r.lat && r.lng && r.lat !== 0 && r.lng !== 0);
    if (rowsWithCoords.length === 0) return;

    let updatedData = [...initialData];

    for (let i = 0; i < rowsWithCoords.length; i++) {
      const row = rowsWithCoords[i];
      const rowIndex = updatedData.findIndex(r => r.row === row.row);
      
      updatedData[rowIndex] = { ...updatedData[rowIndex], status: 'geocoding' };
      setParsedData([...updatedData]);
      
      const geoData = await reverseGeocode(row.lat, row.lng);
      
      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        city: geoData.city,
        state: geoData.state,
        area: geoData.area,
        pincode: geoData.pincode,
        status: 'pending'
      };
      setParsedData([...updatedData]);
      
      setGeocodingProgress(Math.round(((i + 1) / rowsWithCoords.length) * 100));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<{ city: string; state: string; area: string; pincode: string }> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
        {
          headers: {
            'User-Agent': 'ManageYourPGAdmin/1.0'
          }
        }
      );
      const data = await response.json();
      
      console.log('Geocoding response:', data);
      
      if (data.address) {
        const address = data.address;
        return {
          city: address.city || address.town || address.village || address.county || '',
          state: address.state || '',
          area: address.suburb || address.neighbourhood || address.hamlet || address.county || '',
          pincode: address.postcode || ''
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return { city: '', state: '', area: '', pincode: '' };
  };

  const handleUpload = async () => {
    const validRows = parsedData.filter(row => row.status !== 'error' && row.status !== 'geocoding');
    if (validRows.length === 0) {
      alert('No valid rows to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      
      try {
        const pgData = {
          name: row.name,
          type: row.type === 'gents' ? 'male' : row.type === 'ladies' ? 'female' : 'colive',
          address: row.address,
          city: row.city || '',
          state: row.state || '',
          pincode: row.pincode || '',
          area: row.area || '',
          phone: row.phone,
          totalRooms: 0,
          longTermRent: 0,
          shortTermRent: 0,
          price: 0,
          isVerified: false,
          isAvailable: true,
          amenities: [],
          description: `Location: ${row.lat}, ${row.lng}\nImage: ${row.image}\nLink: ${row.link}`,
          images: row.image ? [row.image] : [],
          latitude : row.lat,
          longitude : row.lng,
          location: {
            type: 'Point',
            coordinates: [row.lng, row.lat]
          }
        };

        await adminService.createPG(pgData);
        
        const updatedSuccessData = [...parsedData];
        const successIdx = updatedSuccessData.findIndex(d => d.row === row.row);
        if (successIdx !== -1) {
          updatedSuccessData[successIdx] = { ...updatedSuccessData[successIdx], status: 'success' };
          setParsedData(updatedSuccessData);
        }
        successCount++;
      } catch (error: any) {
        const updatedErrorData = [...parsedData];
        const errorIdx = updatedErrorData.findIndex(d => d.row === row.row);
        if (errorIdx !== -1) {
          updatedErrorData[errorIdx] = { 
            ...updatedErrorData[errorIdx], 
            status: 'error', 
            error: error.response?.data?.message || error.message || 'Upload failed' 
          };
          setParsedData(updatedErrorData);
        }
        errorCount++;
      }

      setUploadProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setUploading(false);
    setUploadProgress(100);

    alert(`Upload complete!\nSuccess: ${successCount}\nFailed: ${errorCount}`);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pg_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetUpload = () => {
    setFile(null);
    setParsedData([]);
    setShowPreview(false);
    setUploadProgress(0);
    setGeocodingProgress(0);
  };

  const pendingCount = parsedData.filter(r => r.status === 'pending').length;
  const successCount = parsedData.filter(r => r.status === 'success').length;
  const errorCount = parsedData.filter(r => r.status === 'error').length;
  const geocodeCount = parsedData.filter(r => r.status === 'geocoding').length;

  return (
    <div>
      <PageHeader
        title="Bulk PG Upload"
        description="Upload multiple PGs at once using CSV format"
      />

      {!showPreview ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-8"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Upload PG Data via CSV</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload a CSV file containing PG details from Google Maps data.
            </p>
          </div>

          <div className="border-2 border-dashed border-border rounded-xl p-12 text-center mb-6 hover:border-primary/50 transition-colors">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg mb-2">Drag and drop your CSV file here</p>
            <p className="text-sm text-muted-foreground mb-4">or</p>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
              <Upload className="w-5 h-5" />
              <span>Choose File</span>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>
            <p className="text-xs text-muted-foreground mt-4">Supported format: CSV</p>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={handleDownloadSample}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Sample CSV
            </button>
          </div>

          <div className="mt-8 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              CSV Format Instructions
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Required columns:</strong> Name, Address, Type</li>
              <li>• <strong>Optional columns:</strong> Phone, Lat, Lng, Image, Link</li>
              <li>• <strong>Type values:</strong> gents, ladies, colive, unknown</li>
              <li>• <strong>Lat/Lng:</strong> Use decimal format (e.g., 13.0930136)</li>
            </ul>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-blue-500" />
                  Preview: {file?.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {parsedData.length} rows found • {errorCount} errors detected
                  {geocodingProgress > 0 && geocodingProgress < 100 && ` • Geocoding: ${geocodingProgress}%`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={resetUpload}
                  className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Reset
                </button>
                <button 
                  onClick={handleDownloadSample}
                  className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Sample
                </button>
              </div>
            </div>

            {geocodingProgress > 0 && geocodingProgress < 100 && !uploading && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Fetching location data...</span>
                  <span className="text-sm text-muted-foreground">{geocodingProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                    style={{ width: `${geocodingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {uploading && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {geocodeCount > 0 ? 'Extracting location data...' : 'Uploading...'}
                  </span>
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Geocoding: {geocodeCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Pending: {pendingCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Success: {successCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Errors: {errorCount}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Row</th>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Address</th>
                    <th className="px-4 py-3 text-left font-medium">Area</th>
                    <th className="px-4 py-3 text-left font-medium">Pincode</th>
                    <th className="px-4 py-3 text-left font-medium">Phone</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row) => (
                    <tr key={row.row} className="border-t border-border">
                      <td className="px-4 py-3">{row.row}</td>
                      <td className="px-4 py-3 font-medium max-w-[150px] truncate">{row.name}</td>
                      <td className="px-4 py-3 max-w-[180px] truncate text-xs text-muted-foreground">{row.address}</td>
                      <td className="px-4 py-3 text-xs">{row.area || '-'}</td>
                      <td className="px-4 py-3 text-xs">{row.pincode || '-'}</td>
                      <td className="px-4 py-3">{row.phone || '-'}</td>
                      <td className="px-4 py-3 capitalize">{row.type}</td>
                      <td className="px-4 py-3">
                        {row.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-yellow-600">
                            <AlertCircle className="w-4 h-4" />
                            Pending
                          </span>
                        )}
                        {row.status === 'geocoding' && (
                          <span className="inline-flex items-center gap-1 text-blue-600">
                            <MapPin className="w-4 h-4 animate-pulse" />
                            Processing
                          </span>
                        )}
                        {row.status === 'success' && (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Uploaded
                          </span>
                        )}
                        {row.status === 'error' && (
                          <span className="inline-flex items-center gap-1 text-red-600" title={row.error}>
                            <XCircle className="w-4 h-4" />
                            {row.error?.substring(0, 20)}...
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
              <button
                onClick={resetUpload}
                className="px-6 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || pendingCount === 0}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Upload {pendingCount} PGs
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}