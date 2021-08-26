import React from 'react';
import './style.css';

const getGoogleContainer = (formData, siteAddress) => {
  return (
    <div style={{ flexBasis: '33%' }}>
      Search Engine Result Preview:{' '}
      <div
        className="seo-container"
        style={{
          display: 'flex',
          width: '100%',
          marginBottom: '2.4rem',
          padding: '20px 30px 16px',
          border: '1px solid #18191b',
          fontFamily: 'Arial,sans-serif',
          background: '#fff',
          borderRadius: '3px',
        }}
      >
        <div className="seo-preview">
          <div className="flex mb7" style={{ display: 'flex', marginBottom: '2.4rem' }}>
            <svg fill="none" className="google-logo" viewBox="0 0 92 31">
              <path
                d="M39.15 15.898c0 4.303-3.378 7.473-7.525 7.473s-7.526-3.17-7.526-7.473c0-4.334 3.38-7.474 7.526-7.474 4.147 0 7.526 3.14 7.526 7.474zm-3.294 0c0-2.69-1.958-4.529-4.231-4.529-2.273 0-4.231 1.84-4.231 4.529 0 2.662 1.958 4.528 4.231 4.528 2.273 0 4.231-1.87 4.231-4.528z"
                fill="#EA4335"
              ></path>
              <path
                d="M55.386 15.898c0 4.303-3.379 7.473-7.526 7.473-4.146 0-7.526-3.17-7.526-7.473 0-4.33 3.38-7.474 7.526-7.474 4.147 0 7.526 3.14 7.526 7.474zm-3.294 0c0-2.69-1.959-4.529-4.232-4.529s-4.231 1.84-4.231 4.529c0 2.662 1.958 4.528 4.231 4.528 2.273 0 4.232-1.87 4.232-4.528z"
                fill="#FBBC05"
              ></path>
              <path
                d="M70.945 8.875v13.418c0 5.52-3.267 7.774-7.13 7.774-3.636 0-5.825-2.423-6.65-4.404l2.868-1.19c.511 1.217 1.763 2.652 3.779 2.652 2.472 0 4.004-1.52 4.004-4.38V21.67h-.115c-.737.906-2.158 1.698-3.95 1.698-3.751 0-7.188-3.255-7.188-7.443 0-4.22 3.437-7.501 7.188-7.501 1.789 0 3.21.792 3.95 1.671h.115V8.88h3.129v-.004zm-2.895 7.05c0-2.632-1.763-4.556-4.005-4.556-2.273 0-4.177 1.924-4.177 4.556 0 2.604 1.904 4.501 4.177 4.501 2.242 0 4.005-1.897 4.005-4.501z"
                fill="#4285F4"
              ></path>
              <path d="M76.103 1.01v21.903H72.89V1.011h3.213z" fill="#34A853"></path>
              <path
                d="M88.624 18.357l2.558 1.699c-.826 1.216-2.815 3.312-6.251 3.312-4.262 0-7.445-3.282-7.445-7.474 0-4.444 3.21-7.473 7.076-7.473 3.893 0 5.798 3.086 6.42 4.754l.341.85-10.028 4.137c.768 1.5 1.962 2.264 3.636 2.264 1.678 0 2.841-.822 3.693-2.069zm-7.87-2.688l6.703-2.774c-.368-.933-1.478-1.583-2.783-1.583-1.674 0-4.005 1.472-3.92 4.357z"
                fill="#EA4335"
              ></path>
              <path
                d="M11.936 13.953v-3.17h10.726c.105.552.159 1.206.159 1.914 0 2.378-.653 5.32-2.757 7.416-2.046 2.123-4.66 3.255-8.124 3.255-6.42 0-11.818-5.21-11.818-11.605C.122 5.368 5.52.158 11.94.158c3.551 0 6.081 1.389 7.982 3.198l-2.246 2.237c-1.363-1.273-3.21-2.264-5.74-2.264-4.688 0-8.354 3.764-8.354 8.434s3.666 8.434 8.354 8.434c3.041 0 4.773-1.216 5.882-2.322.9-.896 1.492-2.176 1.725-3.925l-7.607.003z"
                fill="#4285F4"
              ></path>
            </svg>
            <div className="seo-search-bar">
              <svg viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
              </svg>
            </div>
          </div>
          <div className="seo-preview-link">{siteAddress + '/' + formData.meta?.canonical_URL}</div>
          <div className="seo-preview-title">{formData.meta?.title}</div>
          <div className="seo-preview-desc">{formData.meta?.description}</div>
        </div>
      </div>
    </div>
  );
};

const getTwitterContainer = ({ image, formData, siteAddress }) => {
  return (
    <div style={{ flexBasis: '33%' }}>
      Twitter Preview:{' '}
      <div className="twitter-container">
        <div className="flex ma4" style={{ display: 'flex', margin: '0.8rem' }}>
          <span>
            <svg fill="none" viewBox="0 0 40 40" className="social-icon">
              <circle cx="20" cy="20" r="20" fill="#51B1EF"></circle>
              <path
                d="M30.905 14.268a8.63 8.63 0 01-2.49.686 4.36 4.36 0 001.902-2.403 8.602 8.602 0 01-2.753 1.054c-3.512-3.488-8.463.13-7.396 3.969a12.284 12.284 0 01-8.942-4.543c-1.228 2.093-.428 4.667 1.343 5.798a4.31 4.31 0 01-1.965-.544v.055a4.35 4.35 0 003.48 4.263 4.569 4.569 0 01-1.964.074 4.367 4.367 0 004.053 3.023c-1.918 1.46-4.146 2.062-6.42 1.798 9.793 5.767 19.029-1.783 18.998-10.417 0-.187-.004-.374-.012-.561a9 9 0 002.166-2.248"
                fill="#fff"
              ></path>
            </svg>
          </span>
          <div className="w-100" style={{ width: '100%' }}>
            <span className="social-og-title">{formData.meta?.twitter?.title}</span>
            <span className="social-og-time">12 hrs</span>
            <div
              className="flex flex-column mt2 mb3"
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginBottom: '1.2rem',
                marginTop: '0.8rem',
              }}
            >
              <span
                className="social-og-desc w-100 mb2"
                style={{ width: '100%', marginBottom: '0.8rem' }}
              ></span>
              <span className="social-og-desc w-60" style={{ width: '60%' }}></span>
            </div>
            <div className="social-twitter-post-preview">
              {image && (
                <div
                  className="social-twitter-preview-image"
                  style={{ backgroundImage: image }} // use ImgProxy url
                ></div>
              )}
              <div className="social-twitter-preview-content">
                <div className="social-twitter-preview-title">{formData.meta?.twitter?.title}</div>
                <div className="social-twitter-preview-desc">
                  {formData.meta?.twitter?.description}
                </div>
                <div className="social-twitter-preview-meta">
                  <svg viewBox="0 0 24 24">
                    <g fill="#5b7083">
                      <path d="M11.96 14.945a.833.833 0 01-.203-.027 5.192 5.192 0 01-2.795-1.932c-.832-1.125-1.176-2.508-.968-3.893s.942-2.605 2.068-3.438l3.53-2.608a5.25 5.25 0 017.33 1.1c.83 1.127 1.175 2.51.967 3.895s-.943 2.605-2.07 3.438l-1.48 1.094a.752.752 0 01-.892-1.208l1.48-1.095a3.713 3.713 0 001.476-2.45 3.724 3.724 0 00-.69-2.778 3.745 3.745 0 00-5.23-.784l-3.53 2.608a3.72 3.72 0 00-1.475 2.45c-.15.99.097 1.975.69 2.778a3.701 3.701 0 001.992 1.377.752.752 0 01-.202 1.475z"></path>
                      <path d="M7.27 22.054a5.24 5.24 0 01-5.193-6.019 5.21 5.21 0 012.07-3.438l1.478-1.094a.752.752 0 01.893 1.208l-1.48 1.095a3.716 3.716 0 00-1.475 2.45c-.148.99.097 1.975.69 2.778a3.745 3.745 0 005.23.785l3.528-2.608a3.744 3.744 0 00.785-5.23 3.7 3.7 0 00-1.992-1.376.75.75 0 01-.52-.927c.112-.4.528-.63.926-.522a5.19 5.19 0 012.794 1.932 5.248 5.248 0 01-1.1 7.33l-3.53 2.608a5.189 5.189 0 01-3.105 1.026z"></path>
                    </g>
                  </svg>
                  {siteAddress + '/' + formData.meta?.twitter?.canonical_URL}
                </div>
              </div>
            </div>
            <div className="social-twitter-reactions">
              <div className="flex items-center" style={{ display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 24 24">
                  <path d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828a.85.85 0 00.12.403.744.744 0 001.034.229c.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67a.75.75 0 00-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z"></path>
                </svg>
                2
              </div>
              <div className="flex items-center" style={{ display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 24 24">
                  <path d="M23.77 15.67a.749.749 0 00-1.06 0l-2.22 2.22V7.65a3.755 3.755 0 00-3.75-3.75h-5.85a.75.75 0 000 1.5h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22a.749.749 0 10-1.06 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5a.747.747 0 000-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22a.752.752 0 001.062 0 .749.749 0 000-1.06l-3.5-3.5a.747.747 0 00-1.06 0l-3.5 3.5a.749.749 0 101.06 1.06l2.22-2.22V16.7a3.755 3.755 0 003.75 3.75h5.85a.75.75 0 000-1.5z"></path>
                </svg>
                11
              </div>
              <div className="flex items-center" style={{ display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 24 24">
                  <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.954-2.965z"></path>
                </svg>
                32
              </div>
              <div className="flex items-center" style={{ display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 24 24">
                  <path d="M17.53 7.47l-5-5a.749.749 0 00-1.06 0l-5 5a.749.749 0 101.06 1.06l3.72-3.72V15a.75.75 0 001.5 0V4.81l3.72 3.72c.146.147.338.22.53.22s.384-.072.53-.22a.749.749 0 000-1.06z"></path>
                  <path d="M19.708 21.944H4.292A2.294 2.294 0 012 19.652V14a.75.75 0 011.5 0v5.652c0 .437.355.792.792.792h15.416a.793.793 0 00.792-.792V14a.75.75 0 011.5 0v5.652a2.294 2.294 0 01-2.292 2.292z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getFacebookContainer = ({ image, formData, siteAddress }) => {
  return (
    <div style={{ flexBasis: '33%' }}>
      Facebook Preview:{' '}
      <div className="og-container">
        <div
          className="flex ma3 mb2"
          style={{ display: 'flex', margin: '1.2rem', marginBottom: '0.8rem' }}
        >
          <span>
            <svg fill="none" viewBox="0 0 40 40" className="social-icon">
              <path
                d="M20 40.004c11.046 0 20-8.955 20-20 0-11.046-8.954-20-20-20s-20 8.954-20 20c0 11.045 8.954 20 20 20z"
                fill="#1977F3"
              ></path>
              <path
                d="M27.785 25.785l.886-5.782h-5.546V16.25c0-1.58.773-3.125 3.26-3.125h2.522V8.204s-2.29-.39-4.477-.39c-4.568 0-7.555 2.767-7.555 7.781v4.408h-5.08v5.782h5.08v13.976a20.08 20.08 0 003.125.242c1.063 0 2.107-.085 3.125-.242V25.785h4.66z"
                fill="#fff"
              ></path>
            </svg>
          </span>
          <div>
            <div className="social-og-title">{formData.meta?.twitter?.title}</div>
            <div className="social-og-time">12 hrs</div>
          </div>
        </div>
        <div
          className="flex flex-column ma3 mt2"
          style={{
            display: 'flex',
            flexDirection: 'column',
            margin: '1.2rem',
            marginTop: '0.8rem',
          }}
        >
          <span
            className="social-og-desc w-100 mb2"
            style={{ width: '100%', marginBottom: '0.8rem' }}
          ></span>
          <span className="social-og-desc w-60" style={{ width: '60%' }}></span>
        </div>
        <div className="social-og-preview">
          {image && (
            <div className="social-og-preview-image" style={{ backgroundImage: image }}></div>
          )}
          <div className="social-og-preview-bookmark">
            <div className="social-og-preview-content">
              <div className="social-og-preview-meta">
                {siteAddress + '/' + formData.meta?.facebook?.canonical_URL}
              </div>
              <div className="social-og-preview-title">{formData.meta?.facebook?.title}</div>
              <div className="social-og-preview-desc">{formData.meta?.facebook?.description}</div>
            </div>
          </div>
        </div>
        <div className="social-og-reactions">
          <span className="social-og-likes">
            <svg fill="none" viewBox="0 0 30 30" className="z-999" style={{ zIndex: '999' }}>
              <path
                d="M15 27c6.627 0 12-5.373 12-12S21.627 3 15 3 3 8.373 3 15s5.373 12 12 12z"
                fill="#5E92FF"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M30 15c0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15C0 6.716 6.716 0 15 0c8.284 0 15 6.716 15 15zm-3 0c0 6.627-5.373 12-12 12S3 21.627 3 15 8.373 3 15 3s12 5.373 12 12z"
                fill="#fff"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M9.246 14.078h2.13c.17 0 .304.135.304.305v6.13c0 .17-.134.304-.304.304h-2.13a.31.31 0 01-.313-.305v-6.13a.31.31 0 01.313-.304zm3.687 5.88h6.506a.869.869 0 00.867-.868.887.887 0 00-.554-.806h.16c.457 0 .833-.501.833-.957a.838.838 0 00-.832-.842h-.161v-.071h.465a.844.844 0 00.841-.832.846.846 0 00-.841-.841h-.465v-.072h.465a.844.844 0 00.841-.832.846.846 0 00-.841-.841h-3.642c-.027-.01-.027-.036 0-.09.045-.09.143-.268.295-.537.152-.268.34-.617.439-1.065.098-.447.09-.993.009-1.423-.072-.42-.224-.733-.412-.93a.954.954 0 00-.653-.296c-.233-.008-.475.054-.645.206-.17.161-.259.403-.304.716-.036.322-.009.716-.018.958-.018.241-.062.34-.214.456-.161.116-.421.268-.663.474a5.221 5.221 0 00-.698.797c-.376.483-1.315 1.7-1.315 2.219v4.94c0 .295.242.537.537.537z"
                fill="#FEFEFE"
              ></path>
            </svg>
            <svg fill="none" viewBox="0 0 30 30" className="nl1" style={{ marginLeft: '-0.4rem' }}>
              <path
                d="M15 27c6.627 0 12-5.373 12-12S21.627 3 15 3 3 8.373 3 15s5.373 12 12 12z"
                fill="#FF4F67"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M30 15c0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15C0 6.716 6.716 0 15 0c8.284 0 15 6.716 15 15zm-3 0c0 6.627-5.373 12-12 12S3 21.627 3 15 8.373 3 15 3s12 5.373 12 12z"
                fill="#fff"
              ></path>
              <path
                d="M14.5 11.441C15.434 9.811 16.375 9 18.25 9 20.317 9 22 11.49 22 13.28c0 3.252-4.484 6.777-7.5 8.72-2.713-1.678-7.5-5.468-7.5-8.72C7 11.49 8.684 9 10.75 9c1.875 0 2.809.811 3.75 2.441z"
                fill="#FEFEFE"
              ></path>
            </svg>
            182
          </span>
          <span className="social-og-comments">7 comments</span>
          <span className="social-og-comments ml2" style={{ marginLeft: '0.8rem' }}>
            2 shares
          </span>
        </div>
      </div>
    </div>
  );
};

const SocialCardPreview = ({ image, type, formData, siteAddress }) => {
  //  add time field

  switch (type) {
    case 'google':
      return getGoogleContainer(formData, siteAddress);
    case 'twitter':
      return getTwitterContainer({ image, formData, siteAddress });
    case 'fb':
      return getFacebookContainer({ image, formData, siteAddress });
    default:
      return null;
  }
};

export default SocialCardPreview;
