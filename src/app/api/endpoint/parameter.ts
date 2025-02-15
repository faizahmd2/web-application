import { ParamConfig } from './type';

export class ParameterHandler {
    static validateParam(value: string, config: ParamConfig): any {
      if (!value && config.required) {
        throw new Error(`${config.name} is required`);
      }
  
      if (!value && config.default !== undefined) {
        value = config.default;
      }
  
      switch (config.type) {
        case 'number':
          const num = Number(value);
          if (isNaN(num)) throw new Error(`${config.name} must be a number`);
          return num;
        case 'boolean':
          return value.toLowerCase() === 'true';
        default:
          return value;
      }
    }
  
    static processTemplate(template: string, params: Record<string, any>): any {
      try {
        // Replace placeholders in the template with actual values
        let result = template;
        for (const [key, value] of Object.entries(params)) {
          result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        }
        return JSON.parse(result);
      } catch (error) {
        throw new Error('Error processing response template');
      }
    }
}