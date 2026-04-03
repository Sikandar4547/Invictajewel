import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pkrCurrency',
  standalone: true,
})
export class PkrCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    const amount = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(amount)) {
      return '';
    }

    // Format as PKR currency with 0 decimal places using Intl API
    try {
      const formatter = new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      return formatter.format(amount);
    } catch {
      // Fallback if Intl API is not supported
      return `Rs ${Math.round(amount).toLocaleString('en-PK')}`;
    }
  }
}
