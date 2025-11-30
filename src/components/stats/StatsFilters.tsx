import { useState } from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Campaign } from '@/types/campaign';

const colors = {
  dark: '#3d3731',
  gold: '#f5ca3c',
  muted: '#6b7280',
  border: '#e5e7eb',
  white: '#ffffff',
};

interface StatsFiltersProps {
  campaigns: Campaign[];
  selectedCampaign: string | null;
  dateRange: { from: Date | undefined; to: Date | undefined };
  onCampaignChange: (campaignId: string | null) => void;
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export function StatsFilters({
  campaigns,
  selectedCampaign,
  dateRange,
  onCampaignChange,
  onDateRangeChange,
}: StatsFiltersProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleReset = () => {
    onCampaignChange(null);
    onDateRangeChange({ from: undefined, to: undefined });
  };

  const hasActiveFilters = selectedCampaign || dateRange.from || dateRange.to;

  return (
    <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl border" style={{ background: colors.white, borderColor: colors.border }}>
      <Filter className="w-4 h-4" style={{ color: colors.muted }} />
      
      {/* Campaign Filter */}
      <Select value={selectedCampaign || 'all'} onValueChange={(value) => onCampaignChange(value === 'all' ? null : value)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Toutes les campagnes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les campagnes</SelectItem>
          {campaigns.map((campaign) => (
            <SelectItem key={campaign.id} value={campaign.id}>
              {campaign.title || campaign.app_title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Range Picker */}
      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[240px] justify-start text-left font-normal"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'dd MMM', { locale: fr })} -{' '}
                  {format(dateRange.to, 'dd MMM yyyy', { locale: fr })}
                </>
              ) : (
                format(dateRange.from, 'dd MMM yyyy', { locale: fr })
              )
            ) : (
              <span>Toutes les dates</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range: any) => {
              onDateRangeChange({ from: range?.from, to: range?.to });
              if (range?.from && range?.to) {
                setIsDatePickerOpen(false);
              }
            }}
            numberOfMonths={2}
            locale={fr}
          />
        </PopoverContent>
      </Popover>

      {/* Quick Date Filters */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            onDateRangeChange({ from: weekAgo, to: today });
          }}
        >
          7 jours
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const today = new Date();
            const monthAgo = new Date(today);
            monthAgo.setDate(monthAgo.getDate() - 30);
            onDateRangeChange({ from: monthAgo, to: today });
          }}
        >
          30 jours
        </Button>
      </div>

      {/* Reset button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="ml-auto"
        >
          <X className="w-4 h-4 mr-1" />
          Réinitialiser
        </Button>
      )}
    </div>
  );
}
