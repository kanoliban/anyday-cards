/**
 * Type declarations for @lob/lob-typescript-sdk
 * The SDK has ESM/CJS module resolution issues with bundler mode
 */
declare module '@lob/lob-typescript-sdk' {
  export class Configuration {
    constructor(options?: { username?: string; password?: string });
  }

  export class PostcardsApi {
    constructor(configuration?: Configuration);
    create(
      postcardEditable: PostcardEditable,
      idempotencyKey?: string
    ): Promise<Postcard>;
    get(pscId: string): Promise<Postcard>;
    cancel(pscId: string): Promise<PostcardDeletion>;
    list(
      limit?: number,
      before?: string,
      after?: string,
      include?: string[],
      dateCreated?: Record<string, string>,
      metadata?: Record<string, string>,
      size?: PostcardSize[],
      scheduled?: boolean,
      sendDate?: Record<string, string>,
      mailType?: MailType,
      sortBy?: object
    ): Promise<PostcardList>;
  }

  export class PostcardEditable {
    constructor(input?: Partial<PostcardEditableData>);
    to: string | AddressEditable | null;
    from?: string | AddressEditable | null;
    size?: PostcardSize;
    description?: string | null;
    metadata?: Record<string, string>;
    mail_type?: MailType;
    merge_variables?: object | null;
    send_date?: string;
    front: string;
    back: string;
    billing_group_id?: string;
    qr_code?: QrCode;
    use_type: PscUseType | null;
    toJSON(): object;
  }

  interface PostcardEditableData {
    to: string | AddressEditable | null;
    from?: string | AddressEditable | null;
    size?: PostcardSize;
    description?: string | null;
    metadata?: Record<string, string>;
    mail_type?: MailType;
    merge_variables?: object | null;
    send_date?: string;
    front: string;
    back: string;
    billing_group_id?: string;
    qr_code?: QrCode;
    use_type: PscUseType | null;
  }

  export class AddressEditable {
    constructor(input?: Partial<AddressEditableData>);
    address_line1?: string;
    address_line2?: string | null;
    address_city?: string | null;
    address_state?: string | null;
    address_zip?: string | null;
    address_country?: CountryExtended;
    description?: string | null;
    name?: string | null;
    company?: string | null;
    phone?: string | null;
    email?: string | null;
    metadata?: Record<string, string>;
  }

  interface AddressEditableData {
    address_line1?: string;
    address_line2?: string | null;
    address_city?: string | null;
    address_state?: string | null;
    address_zip?: string | null;
    address_country?: CountryExtended;
    description?: string | null;
    name?: string | null;
    company?: string | null;
    phone?: string | null;
    email?: string | null;
    metadata?: Record<string, string>;
  }

  export enum PostcardSize {
    _4x6 = '4x6',
    _6x9 = '6x9',
    _6x11 = '6x11',
  }

  export enum PscUseType {
    Marketing = 'marketing',
    Operational = 'operational',
    Null = 'null',
  }

  export enum MailType {
    UspsFirstClass = 'usps_first_class',
    UspsStandard = 'usps_standard',
  }

  export enum CountryExtended {
    Us = 'US',
    Ca = 'CA',
    // Add more as needed
  }

  export interface Postcard {
    id: string;
    description?: string | null;
    metadata?: Record<string, string>;
    mail_type?: MailType;
    merge_variables?: object | null;
    send_date?: string;
    size?: PostcardSize;
    to?: object;
    from?: object;
    front_template_id?: string | null;
    back_template_id?: string | null;
    front_template_version_id?: string | null;
    back_template_version_id?: string | null;
    tracking_events?: TrackingEvent[];
    url?: string;
    carrier?: string;
    thumbnails?: Thumbnail[];
    expected_delivery_date?: string;
    date_created?: string;
    date_modified?: string;
    deleted?: boolean;
    object?: string;
  }

  export interface PostcardDeletion {
    id?: string;
    deleted?: boolean;
    object?: string;
  }

  export interface PostcardList {
    data?: Postcard[];
    object?: string;
    next_url?: string | null;
    previous_url?: string | null;
    count?: number;
    total_count?: number;
  }

  export interface TrackingEvent {
    id: string;
    time?: string;
    type?: string;
    name?: string;
    location?: string;
  }

  export interface Thumbnail {
    small?: string;
    medium?: string;
    large?: string;
  }

  export interface QrCode {
    position: string;
    top?: string;
    right?: string;
    left?: string;
    bottom?: string;
    redirect_url: string;
    width: string;
  }
}
