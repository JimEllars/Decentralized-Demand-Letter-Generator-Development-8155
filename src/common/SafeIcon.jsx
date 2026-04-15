import * as FiIcons from 'react-icons/fi';
import { FiAlertTriangle } from 'react-icons/fi';

const SafeIcon = ({ icon: Icon, name, ...props }) => {
  if (Icon) return <Icon {...props} />;
  
  const IconComponent = name ? FiIcons[name] : null;
  if (IconComponent) return <IconComponent {...props} />;
  
  return <FiAlertTriangle {...props} />;
};

export default SafeIcon;