import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
  // Ticket prices in GBP
  #TICKET_PRICES = {
    INFANT: 0,
    CHILD: 15,
    ADULT: 25,
  };

  #MAX_TICKETS = 25;

  #ticketPaymentService;
  #seatReservationService;

  /**
   * Should only have private methods other than the one below.
   */

  constructor() {
    this.#ticketPaymentService = new TicketPaymentService();
    this.#seatReservationService = new SeatReservationService();
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException
    this.#validateAccountId(accountId);
    this.#validateTicketTypeRequests(ticketTypeRequests);

    const ticketCounts = this.#calculateTicketCounts(ticketTypeRequests);
    
    this.#validateTicketPurchaseRules(ticketCounts);

    const totalAmount = this.#calculateTotalAmount(ticketCounts);
    const totalSeats = this.#calculateTotalSeats(ticketCounts);

    // Make payment request
    this.#ticketPaymentService.makePayment(accountId, totalAmount);

    // Reserve seats (Infants don't require seats)
    this.#seatReservationService.reserveSeat(accountId, totalSeats);
  }

  /**
   * Validates that the account ID is valid (greater than 0)
   * @private
   */
  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException('Account ID must be a valid integer greater than 0');
    }
  }

  /**
   * Validates that ticket type requests are provided and valid
   * @private
   */
  #validateTicketTypeRequests(ticketTypeRequests) {
    if (!ticketTypeRequests || ticketTypeRequests.length === 0) {
      throw new InvalidPurchaseException('At least one ticket request must be provided');
    }

    for (const request of ticketTypeRequests) {
      if (!(request instanceof TicketTypeRequest)) {
        throw new InvalidPurchaseException('All ticket requests must be instances of TicketTypeRequest');
      }

      if (request.getNoOfTickets() <= 0) {
        throw new InvalidPurchaseException('Number of tickets must be greater than 0');
      }
    }
  }

  /**
   * Calculates total number of tickets by type
   * @private
   */
  #calculateTicketCounts(ticketTypeRequests) {
    const counts = {
      INFANT: 0,
      CHILD: 0,
      ADULT: 0,
    };

    for (const request of ticketTypeRequests) {
      const type = request.getTicketType();
      counts[type] += request.getNoOfTickets();
    }

    return counts;
  }

  /**
   * Validates business rules for ticket purchase
   * @private
   */
  #validateTicketPurchaseRules(ticketCounts) {
    const totalTickets = ticketCounts.INFANT + ticketCounts.CHILD + ticketCounts.ADULT;

    // Rule: Maximum of 25 tickets can be purchased at a time
    if (totalTickets > this.#MAX_TICKETS) {
      throw new InvalidPurchaseException(`Cannot purchase more than ${this.#MAX_TICKETS} tickets at a time`);
    }

    // Rule: Child and Infant tickets cannot be purchased without an Adult ticket
    if ((ticketCounts.CHILD > 0 || ticketCounts.INFANT > 0) && ticketCounts.ADULT === 0) {
      throw new InvalidPurchaseException('Child and Infant tickets cannot be purchased without an Adult ticket');
    }

    // Additional rule: Infants must sit on Adult's lap (1 infant per adult maximum)
    if (ticketCounts.INFANT > ticketCounts.ADULT) {
      throw new InvalidPurchaseException('Number of Infant tickets cannot exceed number of Adult tickets (Infants sit on Adult laps)');
    }
  }

  /**
   * Calculates the total amount to pay
   * @private
   */
  #calculateTotalAmount(ticketCounts) {
    let total = 0;
    
    for (const [type, count] of Object.entries(ticketCounts)) {
      total += this.#TICKET_PRICES[type] * count;
    }

    return total;
  }

  /**
   * Calculates the total number of seats to reserve
   * Infants do not require seats as they sit on Adult's lap
   * @private
   */
  #calculateTotalSeats(ticketCounts) {
    return ticketCounts.ADULT + ticketCounts.CHILD;
  }
}
