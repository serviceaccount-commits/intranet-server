// Currency a client is billed in. Chosen per client, independently of the
// billing entity or region: a Colombian client may well be billed in USD and
// vice versa, so this is what drives the portal's invoice amounts and their
// number formatting — not the country.
enum CURRENCY {
  COP = 'COP',
  USD = 'USD',
}

export default CURRENCY;
