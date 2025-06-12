// src/services/orderService.ts
import { ref, set, get } from 'firebase/database';
import { rtDatabase } from '../lib/firebase';
import type { CartItem } from '../contexts/CartContext';
import type { OrderConfig } from '../contexts/OrderTypeContext';

export interface OrderItem {
    produitId: string;
    nom: string;
    quantite: number;
    prix: number;
    instructions?: string;
}

export interface Order {
    orderId: string;
    createdAt: string;
    status: 'en_attente' | 'en_preparation' | 'pret' | 'livre' | 'annule';
    items: OrderItem[];
    total: number;
    mode: 'sur_place' | 'emporter';
    tableNumber?: number;
    numeroClient?: number;
    noteCommande?: string;
    restaurantSlug: string;
}

export class OrderService {
    /**
     * Génère un numéro client automatique (1-2000, réinitialisé chaque jour)
     */
    static async generateClientNumber(restaurantSlug: string): Promise<number> {
        try {
            const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
            const counterRef = ref(rtDatabase, `counters/${restaurantSlug}/clientNumbers/${today}`);

            // Récupérer le compteur actuel
            const snapshot = await get(counterRef);
            let currentNumber = snapshot.exists() ? snapshot.val() : 0;

            // Incrémenter (max 2000, puis recommence à 1)
            currentNumber = currentNumber >= 2000 ? 1 : currentNumber + 1;

            // Sauvegarder le nouveau compteur
            await set(counterRef, currentNumber);

            return currentNumber;
        } catch (error) {
            console.error('Erreur génération numéro client:', error);
            // Fallback: numéro aléatoire entre 1 et 2000
            return Math.floor(Math.random() * 2000) + 1;
        }
    }

    /**
     * Nettoie un objet pour supprimer les valeurs undefined (Firebase ne les accepte pas)
     */
    static cleanObjectForFirebase<T>(obj: T): T {
        if (obj === null || obj === undefined) {
            return obj;
        }

        if (typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => OrderService.cleanObjectForFirebase(item)) as T;
        }

        const cleaned = {} as T;
        for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined) {
                (cleaned as any)[key] = OrderService.cleanObjectForFirebase(value);
            }
        }
        return cleaned;
    }
    /**
     * Crée une nouvelle commande dans la Realtime Database
     */
    static async createOrder(
        restaurantSlug: string,
        cartItems: CartItem[],
        orderConfig: OrderConfig,
        total: number,
        orderNote?: string
    ): Promise<{ orderId: string; clientNumber?: number }> {
        try {
            // Générer un ID unique pour la commande
            const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Transformer les items du panier en format commande (en nettoyant les undefined)
            const orderItems: OrderItem[] = cartItems.map(item => {
                const orderItem: OrderItem = {
                    produitId: item.id,
                    nom: item.name,
                    quantite: item.quantity,
                    prix: item.price
                };

                // Ajouter les instructions seulement si elles existent et ne sont pas vides
                if (item.instructions && item.instructions.trim()) {
                    orderItem.instructions = item.instructions.trim();
                }

                return orderItem;
            });

            // Générer le numéro client pour les commandes à emporter
            let clientNumber: number | undefined;
            if (orderConfig.type === 'takeaway') {
                clientNumber = await OrderService.generateClientNumber(restaurantSlug);
            }

            // Créer l'objet commande de base
            const baseOrder = {
                createdAt: new Date().toISOString(),
                status: 'en_attente' as const,
                items: orderItems,
                total: total,
                mode: orderConfig.type === 'dine-in' ? 'sur_place' as const : 'emporter' as const
            };

            // Ajouter les champs conditionnels seulement s'ils existent
            const conditionalFields: Record<string, any> = {};

            if (orderConfig.type === 'dine-in' && orderConfig.tableNumber) {
                conditionalFields.tableNumber = orderConfig.tableNumber;
            }

            if (orderConfig.type === 'takeaway' && clientNumber) {
                conditionalFields.numeroClient = clientNumber;
            }

            if (orderNote && orderNote.trim()) {
                conditionalFields.noteCommande = orderNote.trim();
            }

            // Combiner tous les champs
            const order = { ...baseOrder, ...conditionalFields };

            // Nettoyer l'objet pour Firebase (supprimer les undefined)
            const cleanedOrder = OrderService.cleanObjectForFirebase(order);

            // Déterminer le chemin dans la base de données
            let dbPath: string;
            if (orderConfig.type === 'dine-in' && orderConfig.tableNumber) {
                dbPath = `orders/${restaurantSlug}/tables/${orderConfig.tableNumber}/${orderId}`;
            } else {
                dbPath = `orders/${restaurantSlug}/takeaway/${orderId}`;
            }

            // Enregistrer dans la Realtime Database
            const orderRef = ref(rtDatabase, dbPath);
            await set(orderRef, cleanedOrder);

            console.log(`✅ Commande créée avec succès: ${orderId}`);
            console.log(`📍 Chemin: ${dbPath}`);
            console.log(`📊 Total: ${total}€`);
            console.log(`🍽️ Items: ${orderItems.length}`);
            if (clientNumber) {
                console.log(`🔢 Numéro client: ${clientNumber}`);
            }

            return { orderId, clientNumber };

        } catch (error) {
            console.error('❌ Erreur lors de la création de la commande:', error);
            throw new Error('Impossible de créer la commande');
        }
    }

    /**
     * Met à jour le statut d'une commande
     */
    static async updateOrderStatus(
        restaurantSlug: string,
        orderId: string,
        newStatus: Order['status'],
        isTable: boolean,
        tableNumber?: number
    ): Promise<void> {
        try {
            let dbPath: string;
            if (isTable && tableNumber) {
                dbPath = `orders/${restaurantSlug}/tables/${tableNumber}/${orderId}/status`;
            } else {
                dbPath = `orders/${restaurantSlug}/takeaway/${orderId}/status`;
            }

            const statusRef = ref(rtDatabase, dbPath);
            await set(statusRef, newStatus);

            console.log(`✅ Statut mis à jour: ${orderId} -> ${newStatus}`);
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour du statut:', error);
            throw new Error('Impossible de mettre à jour le statut');
        }
    }

    /**
     * Génère un résumé de la commande pour les logs
     */
    static generateOrderSummary(order: Omit<Order, 'orderId' | 'restaurantSlug'>): string {
        const itemsList = order.items
            .map(item => `- ${item.nom} x${item.quantite}${item.instructions ? ` (${item.instructions})` : ''}`)
            .join('\n');

        return `
🧾 NOUVELLE COMMANDE
━━━━━━━━━━━━━━━━━━━━━━━━
📅 ${new Date(order.createdAt).toLocaleString('fr-FR')}
🎯 Mode: ${order.mode}
${order.tableNumber ? `🪑 Table: ${order.tableNumber}` : ''}
${order.numeroClient ? `🔢 Numéro: ${order.numeroClient}` : ''}
💰 Total: ${order.total.toFixed(2)}€

📋 Articles:
${itemsList}

${order.noteCommande ? `📝 Note: ${order.noteCommande}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim();
    }

    /**
     * Valide les données de commande avant envoi
     */
    static validateOrderData(
        cartItems: CartItem[],
        orderConfig: OrderConfig,
        total: number
    ): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Vérifier les items
        if (!cartItems || cartItems.length === 0) {
            errors.push('Aucun article dans la commande');
        }

        cartItems.forEach((item, index) => {
            if (!item.id || !item.name) {
                errors.push(`Article ${index + 1}: ID ou nom manquant`);
            }
            if (!item.price || item.price <= 0) {
                errors.push(`Article ${index + 1}: Prix invalide`);
            }
            if (!item.quantity || item.quantity <= 0) {
                errors.push(`Article ${index + 1}: Quantité invalide`);
            }
        });

        // Vérifier la configuration de commande
        if (!orderConfig || !orderConfig.type) {
            errors.push('Type de service non défini');
        }

        if (orderConfig.type === 'dine-in') {
            if (!orderConfig.tableNumber || orderConfig.tableNumber <= 0) {
                errors.push('Numéro de table invalide pour service sur place');
            }
        }

        // Vérifier le total
        if (!total || total <= 0) {
            errors.push('Total de commande invalide');
        }

        // Vérifier la cohérence du total
        const calculatedTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalWithFees = calculatedTotal * 1.05; // +5% de frais de service
        if (Math.abs(total - totalWithFees) > 0.01) {
            errors.push('Total incohérent avec les articles');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}