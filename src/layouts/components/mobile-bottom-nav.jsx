import { useLocation, useNavigate } from 'react-router';
import { getNavigationByRole } from '@/config/navigation-config';
import { GlassBottomNav, GlassBottomNavItem } from '@/components/ui/liquid-glass-mobile';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function MobileBottomNav({ onOpenMore }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const bottomItems = getNavigationByRole(user?.rol, 'mobile-bottom');
  const moreItems = getNavigationByRole(user?.rol, 'mobile-more').filter((item) => !item.isDivider);
  const showMore = moreItems.length > 0;
  const items = showMore ? bottomItems.slice(0, 3) : bottomItems.slice(0, 5);
  const isMoreActive = moreItems.some((item) => (
    location.pathname === item.route || location.pathname.startsWith(`${item.route}/`)
  ));

  return (
    <GlassBottomNav>
      {items.map((item) => (
        <GlassBottomNavItem
          key={item.id}
          icon={item.icon}
          label={item.name}
          isActive={location.pathname === item.route || location.pathname.startsWith(`${item.route}/`)}
          onClick={() => navigate(item.route)}
        />
      ))}
      {showMore && (
        <GlassBottomNavItem
          icon="apps"
          label="Más"
          isActive={isMoreActive}
          onClick={onOpenMore}
        />
      )}
    </GlassBottomNav>
  );
}
