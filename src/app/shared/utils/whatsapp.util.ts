/**
 * Utilitaires pour la génération de liens WhatsApp
 * Formatage des messages et des URLs
 */

export class WhatsAppUtil {
  // Numéro WhatsApp de la boutique (format international sans +)
  private static readonly DEFAULT_PHONE = '221787838002';

  /**
   * Génère l'URL WhatsApp complète
   * @param phoneNumber - Numéro de téléphone (optionnel)
   * @param message - Message pré-rempli
   */
  static generateUrl(phoneNumber?: string, message?: string): string {
    const phone = phoneNumber || this.DEFAULT_PHONE;
    let url = `https://wa.me/${phone}`;
    
    if (message) {
      url += `?text=${encodeURIComponent(message)}`;
    }
    
    return url;
  }

  /**
   * Génère l'URL pour un produit
   * @param productName - Nom du produit
   * @param price - Prix du produit
   * @param productId - ID du produit
   * @param customMessage - Message personnalisé (optionnel)
   */
  static generateProductUrl(
    productName: string,
    price: number,
    productId: number,
    customMessage?: string
  ): string {
    const message = customMessage || this.buildProductMessage(productName, price, productId);
    return this.generateUrl(undefined, message);
  }

  /**
   * Construit le message par défaut pour un produit
   * @param productName - Nom du produit
   * @param price - Prix du produit
   * @param productId - ID du produit
   * @param quantity - Quantité (optionnelle)
   */
  static buildProductMessage(
    productName: string,
    price: number,
    productId: number,
    quantity?: number
  ): string {
    const priceFormatted = new Intl.NumberFormat('fr-SN').format(price) + ' FCFA';
    let message = `*DkrOnlineStore*\n\n`;
    message += `Bonjour,\n\n`;
    message += `Je suis intéressé(e) par :\n`;
    message += `📦 *${productName}*\n`;
    message += `💰 ${priceFormatted}`;

    if (quantity && quantity > 1) {
      message += `\n📊 Quantité : ${quantity}`;
    }

    message += `\n\nEst-il disponible ?\n\n`;
    message += `Cordialement.`;

    return message;
  }

  /**
   * Génère l'URL avec un message personnalisé uniquement
   * @param message - Message à envoyer
   */
  static generateUrlWithMessage(message: string): string {
    return this.generateUrl(undefined, message);
  }

  /**
   * Nettoie le numéro de téléphone (enlève les espaces, tirets, etc.)
   * @param phone - Numéro à nettoyer
   */
  static sanitizePhoneNumber(phone: string): string {
    return phone.replace(/[\s\-\(\)\+]/g, '');
  }

  /**
   * Valide un numéro de téléphone sénégalais
   * @param phone - Numéro à valider
   */
  static isValidSenegalPhone(phone: string): boolean {
    const cleaned = this.sanitizePhoneNumber(phone);
    // Format: 221XXXXXXXX ou 77XXXXXXX ou 78XXXXXXX ou 76XXXXXXX
    return /^(221)?(77|78|76|70|75)[0-9]{7}$/.test(cleaned);
  }
}
