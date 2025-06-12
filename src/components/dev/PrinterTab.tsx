// src/components/dev/PrinterTab.tsx
import React, { useState } from 'react';

interface PrinterTabProps {
    onMessage: (message: string) => void;
}

// Types pour les réponses de l'API imprimante
interface PrinterHealthResponse {
    status: string;
    message?: string;
    timestamp?: string;
    uptime?: number;
}

interface PrinterPrintResponse {
    success: boolean;
    message: string;
    printJobId?: string;
    timestamp?: string;
}

interface PrinterErrorResponse {
    error: string;
    details?: string;
    code?: number;
}

// Type union pour toutes les réponses possibles
type PrinterApiResponse = PrinterHealthResponse | PrinterPrintResponse | PrinterErrorResponse | null;

const PrinterTab: React.FC<PrinterTabProps> = ({ onMessage }) => {
    const [printerUrl, setPrinterUrl] = useState('http://192.168.1.142:3001');
    const [authToken, setAuthToken] = useState('ma-cle-secrete');
    const [isLoading, setIsLoading] = useState(false);
    const [lastResponse, setLastResponse] = useState<PrinterApiResponse>(null);

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid #4b5563',
        backgroundColor: '#111827',
        color: '#f9fafb'
    };

    const buttonStyle = {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#facc15',
        color: '#1f2937',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    };

    const secondaryButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#10b981',
        color: '#ffffff'
    };

    const handleHealthCheck = async () => {
        setIsLoading(true);
        setLastResponse(null);

        try {
            onMessage('🔄 Test de connexion en cours...');

            const response = await fetch(`${printerUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                signal: AbortSignal.timeout(10000)
            });

            const data = await response.json() as PrinterHealthResponse;
            setLastResponse(data);

            if (response.ok) {
                onMessage('✅ Connexion imprimante réussie !');
            } else {
                onMessage(`❌ Erreur HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Erreur connexion imprimante:', error);

            if (error instanceof Error) {
                if (error.name === 'TimeoutError') {
                    onMessage('❌ Timeout: L\'imprimante ne répond pas (10s)');
                } else if (error.message.includes('fetch')) {
                    onMessage('❌ Impossible de joindre l\'imprimante - Vérifiez l\'IP et le port');
                } else {
                    onMessage(`❌ Erreur: ${error.message}`);
                }
            } else {
                onMessage('❌ Erreur inconnue lors de la connexion');
            }

            setLastResponse({ error: error instanceof Error ? error.message : 'Erreur inconnue' } as PrinterErrorResponse);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestPrint = async () => {
        setIsLoading(true);

        try {
            onMessage('🖨️ Envoi d\'un test d\'impression...');

            const testOrder = {
                table: "7",
                commandeId: "TEST_" + Date.now(),
                produits: [
                    { nom: "Chawarma poulet", quantite: 2 },
                    { nom: "Falafel", quantite: 1, specialInstructions: "Sans oignons" },
                    { nom: "Coca Cola", quantite: 1 }
                ]
            };

            const response = await fetch(`${printerUrl}/print-ticket`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(testOrder),
                signal: AbortSignal.timeout(15000)
            });

            const data = await response.json() as PrinterPrintResponse;
            setLastResponse(data);

            if (response.ok) {
                onMessage('✅ Test d\'impression envoyé avec succès !');
            } else {
                onMessage(`❌ Erreur impression HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Erreur test impression:', error);
            onMessage('❌ Erreur lors du test d\'impression: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
            setLastResponse({ error: error instanceof Error ? error.message : 'Erreur inconnue' } as PrinterErrorResponse);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#facc15' }}>
                🖨️ Test Imprimante
            </h2>

            {/* Configuration URL et Token */}
            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#374151', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>Configuration</h3>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                        URL de l'imprimante
                    </label>
                    <input
                        value={printerUrl}
                        onChange={(e) => setPrinterUrl(e.target.value)}
                        style={inputStyle}
                        placeholder="http://192.168.1.142:3001"
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Token d'autorisation
                    </label>
                    <input
                        type="password"
                        value={authToken}
                        onChange={(e) => setAuthToken(e.target.value)}
                        style={inputStyle}
                        placeholder="ma-cle-secrete"
                    />
                </div>

                <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                    💡 Assurez-vous que l'imprimante est sur le même réseau WiFi
                </p>
            </div>

            {/* Tests disponibles */}
            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#374151', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>Tests Disponibles</h3>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleHealthCheck}
                        disabled={isLoading || !printerUrl.trim()}
                        style={{
                            ...secondaryButtonStyle,
                            opacity: (isLoading || !printerUrl.trim()) ? 0.5 : 1,
                            cursor: (isLoading || !printerUrl.trim()) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? '🔄 Test...' : '🩺 Test Connexion (Health)'}
                    </button>

                    <button
                        onClick={handleTestPrint}
                        disabled={isLoading || !printerUrl.trim() || !authToken.trim()}
                        style={{
                            ...buttonStyle,
                            opacity: (isLoading || !printerUrl.trim() || !authToken.trim()) ? 0.5 : 1,
                            cursor: (isLoading || !printerUrl.trim() || !authToken.trim()) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? '🔄 Impression...' : '🖨️ Test Impression (print-ticket)'}
                    </button>
                </div>
            </div>

            {/* Réponse de l'API */}
            {lastResponse && (
                <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#374151', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>Dernière Réponse</h3>
                    <pre style={{
                        backgroundColor: '#1f2937',
                        padding: '1rem',
                        borderRadius: '6px',
                        color: '#e5e7eb',
                        fontSize: '0.875rem',
                        overflow: 'auto',
                        maxHeight: '300px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                    }}>
                        {JSON.stringify(lastResponse, null, 2)}
                    </pre>
                </div>
            )}

            {/* Guide de démarrage */}
            <div style={{ padding: '1rem', backgroundColor: '#1e3a8a', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                <h3 style={{ marginBottom: '1rem', color: '#93c5fd' }}>📖 Guide de Test</h3>
                <div style={{ fontSize: '0.875rem', color: '#dbeafe', lineHeight: '1.6' }}>
                    <p><strong>1. Test Connexion:</strong> Vérifiez que l'imprimante répond sur /health</p>
                    <p><strong>2. Test Impression:</strong> Envoyez une commande de test avec table + produits</p>
                    <p><strong>3. Authorization:</strong> Token Bearer requis pour l'impression</p>
                    <p><strong>4. Format:</strong> table, commandeId, produits (avec specialInstructions)</p>
                    <p><strong>5. Réseau:</strong> L'imprimante doit être sur le même WiFi</p>
                </div>
            </div>

            {/* Informations réseau */}
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#374151', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '1rem', color: '#facc15' }}>🌐 Informations API</h3>
                <div style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
                    <p><strong>URL configurée:</strong> {printerUrl}</p>
                    <p><strong>Endpoint Health:</strong> {printerUrl}/health</p>
                    <p><strong>Endpoint Print:</strong> {printerUrl}/print-ticket</p>
                    <p><strong>Authorization:</strong> Bearer {authToken ? '***' + authToken.slice(-4) : 'Non configuré'}</p>
                    <p><strong>Timeout:</strong> 10s (health) / 15s (print)</p>
                </div>

                {/* Exemple de payload */}
                <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ color: '#facc15', marginBottom: '0.5rem' }}>Exemple de payload envoyé :</h4>
                    <pre style={{
                        backgroundColor: '#1f2937',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        color: '#e5e7eb',
                        fontSize: '0.75rem',
                        overflow: 'auto'
                    }}>
{`{
  "table": "7",
  "commandeId": "TEST_1234567890",
  "produits": [
    {
      "nom": "Chawarma poulet",
      "quantite": 2
    },
    {
      "nom": "Falafel",
      "quantite": 1,
      "specialInstructions": "Sans oignons"
    },
    {
      "nom": "Coca Cola",
      "quantite": 1
    }
  ]
}`}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default PrinterTab;