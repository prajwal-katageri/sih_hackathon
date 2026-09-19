import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertTriangle, RefreshCw, Cpu, Globe } from 'lucide-react';
import { checkBackendHealth, saveBackendConfig } from '../services/apiClient';

export default function BackendConfigModal({ isOpen, onClose, backendConfig, onUpdateConfig }) {
  const [url, setUrl] = useState(backendConfig.baseUrl);
  const [enabled, setEnabled] = useState(backendConfig.isEnabled);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await checkBackendHealth(url);
    setTesting(false);
    setTestResult(result);
  };

  const handleSave = () => {
    saveBackendConfig(url, enabled);
    onUpdateConfig({ baseUrl: url, isEnabled: enabled });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-slate-100">External Backend Device Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 border border-slate-800 p-3 rounded-lg">
            Connect this frontend to your team's backend (Flask, Spring Boot, or Python REST API) running on another laptop or device on your local network (e.g. Wi-Fi router IP).
          </p>

          {/* Toggle Enable Remote API */}
          <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-3">
              {enabled ? <Globe className="w-5 h-5 text-emerald-400" /> : <Cpu className="w-5 h-5 text-slate-400" />}
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {enabled ? 'Remote Device API Link Enabled' : 'Standalone In-Browser Engine'}
                </p>
                <p className="text-xs text-slate-400">
                  {enabled ? 'Attempts REST API calls to secondary device' : 'Runs simulation physics locally inside browser'}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={enabled} 
                onChange={(e) => setEnabled(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Secondary Device Base REST URL
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. http://192.168.1.105:5000/api"
                disabled={!enabled}
                className="flex-1 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
              <button
                onClick={handleTestConnection}
                disabled={!enabled || testing}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition border border-slate-700"
              >
                {testing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                ) : (
                  <span>Test Ping</span>
                )}
              </button>
            </div>
          </div>

          {/* Test Connection Results */}
          {testResult && (
            <div className={`p-3 rounded-lg border text-xs flex items-start space-x-2 ${
              testResult.online
                ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-200'
                : 'bg-rose-950/60 border-rose-600/50 text-rose-200'
            }`}>
              {testResult.online ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">
                  {testResult.online ? 'Device Connected Successfully!' : 'Device Connection Failed'}
                </p>
                <p className="text-slate-300 mt-0.5">
                  {testResult.online ? 'Spring Boot / Flask endpoint is responding cleanly.' : testResult.error}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/30"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
