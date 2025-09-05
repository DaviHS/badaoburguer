export class OrderStatusService {
  // Defina o fluxo de status permitido
  private static statusFlow: Record<number, number[]> = {
    // Pendente → pode ir para Pago ou Cancelado
    0: [1, 6], 
    // Pago → pode ir para Preparando ou Cancelado
    1: [2, 6],
    // Preparando → pode ir para Pronto
    2: [3],
    // Pronto → pode ir para Entregando
    3: [4],
    // Entregando → pode ir para Entregue
    4: [5],
    // Entregue → estado final
    5: [],
    // Cancelado → estado final
    6: []
  };

  // Verificar se a transição é permitida
  static canTransition(fromStatus: number, toStatus: number): boolean {
    const allowedTransitions = this.statusFlow[fromStatus] || [];
    return allowedTransitions.includes(toStatus);
  }

  // Obter próximos status possíveis
  static getNextPossibleStatuses(currentStatus: number): number[] {
    return this.statusFlow[currentStatus] || [];
  }

  // Validar transição e retornar erro se não for permitida
  static validateTransition(fromStatus: number, toStatus: number): void {
    if (!this.canTransition(fromStatus, toStatus)) {
      throw new Error(
        `Transição de status não permitida: ${fromStatus} → ${toStatus}. ` +
        `Status permitidos: ${this.getNextPossibleStatuses(fromStatus).join(', ')}`
      );
    }
  }

  // Verificar se é um status final
  static isFinalStatus(status: number): boolean {
    return [5, 6].includes(status); // Entregue ou Cancelado
  }
}