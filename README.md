# Cinema Tickets JavaScript

A ticket purchasing service implementation for a cinema booking system that handles ticket purchases, payments, and seat reservations according to specific business rules.

## Table of Contents

- [Overview](#overview)
- [Business Rules](#business-rules)
- [Technical Requirements](#technical-requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Implementation Details](#implementation-details)
- [Testing](#testing)
- [API Documentation](#api-documentation)

## Overview

This project provides a robust implementation of a `TicketService` that processes cinema ticket purchases. The service validates purchase requests, calculates payments, and reserves seats while enforcing business rules such as ticket limits, pricing, and age-based requirements.

## Business Rules

The implementation adheres to the following business rules:

### Ticket Types and Pricing

| Ticket Type | Price | Seat Required |
|------------|-------|---------------|
| INFANT     | £0    | No (sits on Adult's lap) |
| CHILD      | £15   | Yes |
| ADULT      | £25   | Yes |

### Purchase Constraints

1. **Maximum Tickets**: Only 25 tickets can be purchased in a single transaction
2. **Adult Requirement**: Child and Infant tickets cannot be purchased without purchasing at least one Adult ticket
3. **Infant Seating**: Infants sit on Adult laps, so the number of Infant tickets cannot exceed the number of Adult tickets
4. **Account Validation**: Only accounts with an ID greater than 0 are valid
5. **Positive Quantities**: Each ticket type must have at least 1 ticket if included in the request

### External Services

- **TicketPaymentService**: Handles payment processing (external provider, assumed reliable)
- **SeatReservationService**: Manages seat reservations (external provider, assumed reliable)

## Technical Requirements

- **Node.js**: >= 20.9.0
- **Module System**: ES Modules (type: "module")
- **Testing Framework**: Jest (with ES modules support)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cinema-tickets-javascript
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Basic Example

```javascript
import TicketService from './src/pairtest/TicketService.js';
import TicketTypeRequest from './src/pairtest/lib/TicketTypeRequest.js';

const ticketService = new TicketService();

// Purchase 2 adult tickets and 3 child tickets
try {
  ticketService.purchaseTickets(
    123, // Valid account ID (> 0)
    new TicketTypeRequest('ADULT', 2),
    new TicketTypeRequest('CHILD', 3)
  );
  console.log('Tickets purchased successfully!');
} catch (error) {
  console.error('Purchase failed:', error.message);
}
```

### Valid Purchase Examples

```javascript
// Adult tickets only
ticketService.purchaseTickets(
  1,
  new TicketTypeRequest('ADULT', 3)
);

// Adults with children
ticketService.purchaseTickets(
  1,
  new TicketTypeRequest('ADULT', 2),
  new TicketTypeRequest('CHILD', 3)
);

// Full family (adults, children, and infants)
ticketService.purchaseTickets(
  1,
  new TicketTypeRequest('ADULT', 2),
  new TicketTypeRequest('CHILD', 2),
  new TicketTypeRequest('INFANT', 1)
);
```

### Invalid Purchase Examples

```javascript
// ❌ Child tickets without adult
ticketService.purchaseTickets(1, new TicketTypeRequest('CHILD', 2));
// Throws: InvalidPurchaseException

// ❌ More than 25 tickets
ticketService.purchaseTickets(
  1,
  new TicketTypeRequest('ADULT', 26)
);
// Throws: InvalidPurchaseException

// ❌ More infants than adults
ticketService.purchaseTickets(
  1,
  new TicketTypeRequest('ADULT', 1),
  new TicketTypeRequest('INFANT', 2)
);
// Throws: InvalidPurchaseException

// ❌ Invalid account ID
ticketService.purchaseTickets(
  0, // or negative number
  new TicketTypeRequest('ADULT', 1)
);
// Throws: InvalidPurchaseException
```

## Project Structure

```
cinema-tickets-javascript/
├── src/
│   ├── pairtest/
│   │   ├── TicketService.js           # Main service implementation
│   │   └── lib/
│   │       ├── InvalidPurchaseException.js
│   │       └── TicketTypeRequest.js   # Immutable ticket request object
│   └── thirdparty/
│       ├── paymentgateway/
│       │   └── TicketPaymentService.js
│       └── seatbooking/
│           └── SeatReservationService.js
├── test/
│   └── TicketService.test.js          # Comprehensive test suite
├── package.json
├── instructions.md                     # Original requirements
└── README.md                          # This file
```

## Implementation Details

### TicketService Class

The `TicketService` class implements the ticket purchasing logic with the following responsibilities:

#### Validation
- **Account ID**: Validates that the account ID is an integer greater than 0
- **Ticket Requests**: Ensures at least one valid `TicketTypeRequest` is provided
- **Quantity**: Verifies each ticket request has a positive number of tickets
- **Total Limit**: Enforces the maximum 25 tickets per transaction
- **Adult Requirement**: Ensures Adult tickets are present when Child or Infant tickets are requested
- **Infant Constraint**: Validates that Infant tickets don't exceed Adult tickets

#### Calculation
- **Total Payment**: Calculates the total cost based on ticket types and quantities
  - Adults: £25 each
  - Children: £15 each
  - Infants: £0 each
- **Seat Allocation**: Determines the number of seats needed (Adult + Child, excluding Infants)

#### External Service Integration
- Makes payment requests to `TicketPaymentService`
- Makes seat reservation requests to `SeatReservationService`

### Design Decisions

1. **Private Methods**: All helper methods are private (using `#` syntax) to encapsulate implementation details
2. **Immutability**: The `TicketTypeRequest` class is immutable as required
3. **Single Responsibility**: Each private method has a focused, single purpose
4. **Clear Error Messages**: Exceptions provide descriptive messages for debugging
5. **Defensive Programming**: Comprehensive validation prevents invalid states

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

The test suite includes comprehensive coverage of:

- ✅ Valid ticket purchases (various combinations)
- ✅ Invalid account IDs (0, negative, non-integer, null)
- ✅ Ticket quantity validation
- ✅ Maximum ticket limit (25 tickets)
- ✅ Adult requirement for Child/Infant tickets
- ✅ Infant-to-Adult ratio constraint
- ✅ Edge cases (multiple requests, exact limits, large account IDs)
- ✅ Payment and seat calculation logic

### Example Test Output

```
PASS  test/TicketService.test.js
  TicketService
    Valid ticket purchases
      ✓ should successfully purchase adult tickets only
      ✓ should successfully purchase adult and child tickets
      ✓ should successfully purchase adult, child, and infant tickets
      ✓ should successfully purchase with infants equal to adults
      ✓ should successfully purchase maximum 25 tickets
    Invalid account ID
      ✓ should throw error for account ID of 0
      ✓ should throw error for negative account ID
    Invalid ticket purchase rules
      ✓ should throw error when no ticket requests provided
      ✓ should throw error for more than 25 tickets
      ✓ should throw error for child tickets without adult
      ...
```

## API Documentation

### `TicketService`

#### Constructor
```javascript
new TicketService()
```
Creates a new instance of the ticket service with initialized payment and seat reservation services.

#### Methods

##### `purchaseTickets(accountId, ...ticketTypeRequests)`

Processes a ticket purchase request.

**Parameters:**
- `accountId` (number): The customer's account ID (must be > 0)
- `ticketTypeRequests` (...TicketTypeRequest): Variable number of ticket type requests

**Throws:**
- `InvalidPurchaseException`: When validation fails or business rules are violated

**Example:**
```javascript
ticketService.purchaseTickets(
  123,
  new TicketTypeRequest('ADULT', 2),
  new TicketTypeRequest('CHILD', 1)
);
```

### `TicketTypeRequest`

#### Constructor
```javascript
new TicketTypeRequest(type, noOfTickets)
```

**Parameters:**
- `type` (string): Ticket type - must be 'ADULT', 'CHILD', or 'INFANT'
- `noOfTickets` (number): Number of tickets (must be a positive integer)

**Methods:**
- `getTicketType()`: Returns the ticket type
- `getNoOfTickets()`: Returns the number of tickets

### `InvalidPurchaseException`

Extends the standard `Error` class. Thrown when a ticket purchase request is invalid.

## Constraints and Assumptions

### Constraints
- The `TicketService` interface cannot be modified
- Third-party service code cannot be modified
- `TicketTypeRequest` must remain immutable

### Assumptions
- All accounts with ID > 0 are valid and have sufficient funds
- `TicketPaymentService` is reliable and payments always succeed
- `SeatReservationService` is reliable and reservations always succeed
- External services handle their own error scenarios

## License

This project is for demonstration and educational purposes.

## Author

Implemented as a coding exercise to demonstrate clean code practices, proper validation, and adherence to business requirements.
