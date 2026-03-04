// Email Components Index
// Re-export all email components for easier imports

export { default as EmailTemplateLibrary } from './EmailTemplateLibrary';
export { default as EmailTemplateSelector } from './EmailTemplateSelector';
export { default as AdvancedEmailBuilder } from './AdvancedEmailBuilder';
export { default as EmailPreviewRenderer } from './EmailPreviewRenderer';
export { default as EmailAnalytics } from './EmailAnalytics';
export { default as EmailTemplateReference } from './EmailTemplateReference';

// Export template constants
export { 
  TEMPLATE_QUICK_REFERENCE, 
  TEMPLATE_FORMAT, 
  STYLE_REFERENCE 
} from './EmailTemplateReference';

// Export template library
import EMAIL_TEMPLATES from './EmailTemplateLibrary';
export { EMAIL_TEMPLATES };
