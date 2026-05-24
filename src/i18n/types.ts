import pt from '../messages/pt.json';

type Messages = typeof pt;

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
