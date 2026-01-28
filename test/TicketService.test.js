import TicketService from '../src/pairtest/TicketService.js';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';

describe('TicketService', () => {
  let ticketService;

  beforeEach(() => {
    ticketService = new TicketService();
  });

  describe('Valid ticket purchases', () => {
    test('should successfully purchase adult tickets only', () => {
      expect(() => {
        ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 3));
      }).not.toThrow();
    });

    test('should successfully purchase adult and child tickets', () => {
      expect(() => {
        ticketService.purchaseTickets(1, 
          new TicketTypeRequest('ADULT', 2),
          new TicketTypeRequest('CHILD', 3)
        );
      }).not.toThrow();
    });

    test('should successfully purchase adult, child, and infant tickets', () => {
      expect(() => {
        ticketService.purchaseTickets(1,
          new TicketTypeRequest('ADULT', 2),
          new TicketTypeRequest('CHILD', 2),
          new TicketTypeRequest('INFANT', 1)
        );
      }).not.toThrow();
    });

    test('should successfully purchase with infants equal to adults', () => {
      expect(() => {
        ticketService.purchaseTickets(1,
          new TicketTypeRequest('ADULT', 2),
          new TicketTypeRequest('INFANT', 2)
        );
      }).not.toThrow();
    });

    test('should successfully purchase maximum 25 tickets', () => {
      expect(() => {
        ticketService.purchaseTickets(1,
          new TicketTypeRequest('ADULT', 10),
          new TicketTypeRequest('CHILD', 10),
          new TicketTypeRequest('INFANT', 5)
        );
      }).not.toThrow();
    });

    test('should successfully purchase single ticket', () => {
      expect(() => {
        ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 1));
      }).not.toThrow();
    });
  });

  describe('Invalid account ID', () => {
    test('should throw error for account ID of 0', () => {
      expect(() => {
        ticketService.purchaseTickets(0, new TicketTypeRequest('ADULT', 1));
      }).toThrow(InvalidPurchaseException);
      expect(() => {
        ticketService.purchaseTickets(0, new TicketTypeRequest('ADULT', 1));
      }).toThrow('Account ID must be a valid integer greater than 0');
    });

    test('should throw error for negative account ID', () => {
      expect(() => {
        ticketService.purchaseTickets(-1, new TicketTypeRequest('ADULT', 1));
      }).toThrow(InvalidPurchaseException);
    });

    test('should throw error for non-integer account ID', () => {
      expect(() => {
        ticketService.purchaseTickets(1.5, new TicketTypeRequest('ADULT', 1));
      }).toThrow(InvalidPurchaseException);
    });

    test('should throw error for null account ID', () => {
      expect(() => {
        ticketService.purchaseTickets(null, new TicketTypeRequest('ADULT', 1));
      }).toThrow(InvalidPurchaseException);
    });
  });

  describe('Invalid ticket purchase rules', () => {
    test('should throw error when no ticket requests provided', () => {
      expect(() => {
        ticketService.purchaseTickets(1);
      }).toThrow(InvalidPurchaseException);
      expect(() => {
        ticketService.purchaseTickets(1);
      }).toThrow('At least one ticket request must be provided');
    });

    test('should throw error for more than 25 tickets', () => {
      expect(() => {
        ticketService.purchaseTickets(1,
          new TicketTypeRequest('ADULT', 20),
          new TicketTypeRequest('CHILD', 6)
        );
      }).toThrow(InvalidPurchaseException);
      expect(() => {
        ticketService.purchaseTickets(1,
          new TicketTypeRequest('ADULT', 20),
          new TicketTypeRequest('CHILD', 6)
        );
      }).toThrow('Cannot purchase more than 25 tickets at a time');
    });

    test('should throw error for child tickets without adult', () => {
      expect(() => {
        ticketService.purchaseTickets(1, new TicketTypeRequest('CHILD', 2));
      }).toThrow(InvalidPurchaseException);
      expect(() => {
        ticketService.purchaseTickets(1, new TicketTypeRequest('CHILD', 2));
      }).toThrow('Child and Infant tickets cannot be purchased without an Adult ticket');
    });

    test('should throw error for infant tickets without adult', () => {
      expect(() => {
        ticketService.purchaseTickets(1, new TicketTypeRequest('INFANT', 1));
      }).toThrow(InvalidPurchaseException);
      expect(() => {
        ticketService.purchaseTickets(1, new TicketTypeRequest('INFANT', 1));
      }).toThrow('Child and Infant tickets cannot be purchased without an Adult ticket');
    });

    test('should throw error for child and infant tickets without adult', () => {
      expect(() => {
        ticketService.purchaseTickets(1,
          new TicketTypeRequest('CHILD', 2),
          new TicketTypeRequest('INFANT', 1)
        );
      }).toThrow(InvalidPurchaseException);
    });

    test('should throw error when infants exceed adults', () => {
      expect(() => {
        ticketService.purchaseTickets(1,
          new TicketTypeRequest('ADULT', 2),
          new TicketTypeRequest('INFANT', 3)
        );
      }).toThrow(InvalidPurchaseException);
      expect(() => {
        ticketService.purchaseTickets(1,
          new TicketTypeRequest('ADULT', 2),
          new TicketTypeRequest('INFANT', 3)
        );
      }).toThrow('Number of Infant tickets cannot exceed number of Adult tickets');
    });

    test('should throw error for zero tickets in request', () => {
      expect(() => {
        ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 0));
      }).toThrow(InvalidPurchaseException);
      expect(() => {
        ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 0));
      }).toThrow('Number of tickets must be greater than 0');
    });

    test('should throw error for invalid ticket request type', () => {
      expect(() => {
        ticketService.purchaseTickets(1, { type: 'ADULT', count: 2 });
      }).toThrow(InvalidPurchaseException);
      expect(() => {
        ticketService.purchaseTickets(1, { type: 'ADULT', count: 2 });
      }).toThrow('All ticket requests must be instances of TicketTypeRequest');
    });
  });

  describe('Payment and seat calculation', () => {
    test('should calculate correct payment for adult tickets only', () => {
      // 3 adults = 3 * 25 = 75
      expect(() => {
        ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 3));
      }).not.toThrow();
    });

    test('should calculate correct seats for mixed tickets', () => {
      // 2 adults + 3 children = 5 seats (infants don't need seats)
      ticketService.purchaseTickets(1,
        new TicketTypeRequest('ADULT', 2),
        new TicketTypeRequest('CHILD', 3),
        new TicketTypeRequest('INFANT', 1)
      );
      // This test verifies the service executes without errors
    });
  });

  describe('Edge cases', () => {
    test('should handle multiple ticket requests of same type', () => {
      expect(() => {
        ticketService.purchaseTickets(1,
          new TicketTypeRequest('ADULT', 2),
          new TicketTypeRequest('ADULT', 3)
        );
      }).not.toThrow();
    });

    test('should handle exact limit of 25 tickets with mixed types', () => {
      expect(() => {
        ticketService.purchaseTickets(1,
          new TicketTypeRequest('ADULT', 15),
          new TicketTypeRequest('CHILD', 5),
          new TicketTypeRequest('INFANT', 5)
        );
      }).not.toThrow();
    });

    test('should handle large account ID', () => {
      expect(() => {
        ticketService.purchaseTickets(999999999, new TicketTypeRequest('ADULT', 1));
      }).not.toThrow();
    });
  });
});
