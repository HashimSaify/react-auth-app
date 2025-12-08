import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Link,
} from 'react-router-dom';

// ---- Backend API base URL ----
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/auth';

const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const PASSWORD_RULE_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.';


// ================== Shared styles ==================

const appContainerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#f3f4f6',
  fontFamily: 'system-ui, sans-serif',
};

const contentWrapperStyle: React.CSSProperties = {
  maxWidth: '420px',
  margin: '0 auto',
  padding: '2rem 1rem 3rem',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.9rem 1.5rem',
  background: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
};

const headerRightStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const headerButtonStyle: React.CSSProperties = {
  padding: '0.35rem 0.8rem',
  borderRadius: '999px',
  border: '1px solid #d1d5db',
  background: '#ffffff',
  fontSize: '0.8rem',
  cursor: 'pointer',
};

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: '0.75rem',
  padding: '1.75rem 1.5rem',
  boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  marginBottom: '0.25rem',
  color: '#111827',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  marginBottom: '1.5rem',
  color: '#6b7280',
};

const formGroupStyle: React.CSSProperties = {
  marginBottom: '0.9rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.25rem',
  fontSize: '0.85rem',
  color: '#374151',
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.55rem 0.65rem',
  borderRadius: '0.5rem',
  border: '1px solid #d1d5db',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.7rem',
  borderRadius: '0.5rem',
  border: 'none',
  background: '#111827',
  color: '#f9fafb',
  fontWeight: 600,
  fontSize: '0.95rem',
  cursor: 'pointer',
  marginTop: '0.3rem',
};

const buttonDisabledStyle: React.CSSProperties = {
  ...buttonStyle,
  opacity: 0.7,
  cursor: 'not-allowed',
};

const errorTextStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#b91c1c',
  marginBottom: '0.75rem',
};

const smallTextStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#6b7280',
};

// ================== Home page ==================

function HomePage({ userName }: { userName: string | null }) {
  const displayName =
    userName && userName.trim().length > 0 ? userName : 'User';

  return (
    <div style={cardStyle}>
      <h2 style={titleStyle}>Welcome, {displayName} 👋</h2>
      <p style={subtitleStyle}>You are now logged in to the app.</p>
      <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>
        Use the <strong>Profile</strong> and <strong>Logout</strong> buttons in
        the top-right corner to view your profile info or to leave the app.
      </p>
    </div>
  );
}

// ================== Login page ==================

type LoginFormData = {
  email: string;
  password: string;
};

type LoginPageProps = {
  onLoginSuccess: (
    displayName: string,
    token: string,
    rememberMe: boolean
  ) => void;
};

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show green message if we came from successful signup
  useEffect(() => {
    const state = location.state as { signupSuccess?: boolean } | null;

    if (state?.signupSuccess) {
      setSuccessMessage('Account created successfully. Please log in.');

      // Clear the state from the history so the message only shows once
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleRememberMeChange(event: React.ChangeEvent<HTMLInputElement>) {
    setRememberMe(event.target.checked);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Login failed.');
        setIsSubmitting(false);
        return;
      }

      const token: string = data.token;
      const displayName: string =
        data.user?.name || data.user?.email || formData.email;

      // Tell App that login succeeded (it will store token, handle rememberMe, etc.)
      onLoginSuccess(displayName, token, rememberMe);

      // Go to home page
      navigate('/');
    } catch (error) {
      console.error('Error calling login API:', error);
      setErrorMessage('Could not connect to server. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <div style={cardStyle}>
      <h2 style={titleStyle}>Login</h2>
      <p style={subtitleStyle}>Enter your credentials to continue.</p>

      {successMessage && (
        <p
          style={{
            ...smallTextStyle,
            color: '#15803d',
            marginBottom: '0.75rem',
          }}
        >
          {successMessage}
        </p>
      )}

      {errorMessage && <p style={errorTextStyle}>{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleInputChange}
            style={inputStyle}
            required
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            style={inputStyle}
            required
          />
        </div>

        <div
          style={{
            ...formGroupStyle,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <label style={{ ...labelStyle, marginBottom: 0 }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberMeChange}
              style={{ marginRight: '0.4rem' }}
            />
            Remember me for 1 day
          </label>
        </div>

        <button
          type="submit"
          style={isSubmitting ? buttonDisabledStyle : buttonStyle}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ ...smallTextStyle, marginTop: '0.75rem' }}>
        Don&apos;t have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}


// ================== Sign Up page ==================

type SignUpFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    // ---- Frontend password validation ----
    if (!PASSWORD_REGEX.test(formData.password)) {
      setErrorMessage(PASSWORD_RULE_MESSAGE);
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

            if (!response.ok) {
        setErrorMessage(data.message || 'Sign up failed.');
        setIsSubmitting(false);
        return;
      }

      console.log('Signup API success:', data);

      // Account created successfully.
      // Stop loading and send user to login page.
     setIsSubmitting(false);
     navigate('/login', { state: { signupSuccess: true } });
    } catch (error) {
      console.error('Error calling signup API:', error);
      setErrorMessage('Could not connect to server. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <div style={cardStyle}>
      <h2 style={titleStyle}>Create an account</h2>
      <p style={subtitleStyle}>Join the app to access your personal profile.</p>

      {errorMessage && <p style={errorTextStyle}>{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleInputChange}
            style={inputStyle}
            required
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleInputChange}
            style={inputStyle}
            required
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            style={inputStyle}
            required
          />
          <p style={{ ...smallTextStyle, marginTop: '0.25rem' }}>
            Must include uppercase, lowercase, number, and symbol (min 8
            characters).
          </p>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Repeat password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            style={inputStyle}
            required
          />
        </div>

        <button
          type="submit"
          style={isSubmitting ? buttonDisabledStyle : buttonStyle}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p style={{ ...smallTextStyle, marginTop: '0.75rem' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

// ================== Profile page ==================

type ProfilePageProps = {
  userName: string | null;
  token: string | null;
  onNameChange: (name: string) => void;
};

type ProfileData = {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
};

function ProfilePage({ userName, token, onNameChange }: ProfilePageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const displayName =
    userName && userName.trim().length > 0 ? userName : 'User';

  // ------------ helper: get token ------------
  function getValidToken(): string | null {
    let tokenToUse: string | null = token || null;

    if (!tokenToUse) {
      const stored = localStorage.getItem('authData');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
            tokenToUse = parsed.token;
          }
        } catch {
          /* ignore */
        }
      }
    }

    return tokenToUse;
  }

  // ------------ fetch profile once ------------
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError('');
        setSuccessMessage('');

        const tokenToUse = getValidToken();
        if (!tokenToUse) {
          setError('No valid token found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${tokenToUse}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Failed to load profile.');
          setLoading(false);
          return;
        }

        setProfile(data.user);
        setEditName(data.user.name || '');
        setEditEmail(data.user.email || '');
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Could not load profile. Please try again.');
        setLoading(false);
      }
    }

    fetchProfile();
  }, [token]);

  // ------------ save profile (name + email) ------------
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const tokenToUse = getValidToken();
    if (!tokenToUse) {
      setError('No valid token found. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenToUse}`,
        },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to update profile.');
        return;
      }

      setProfile((prev) =>
        prev
          ? { ...prev, name: data.user.name, email: data.user.email }
          : data.user
      );

      setSuccessMessage('Profile updated successfully.');
      setIsEditingProfile(false);

      onNameChange(data.user.name || editName);

      const stored = localStorage.getItem('authData');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.userName = data.user.name || editName;
          localStorage.setItem('authData', JSON.stringify(parsed));
        } catch {
          /* ignore */
        }
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Could not update profile. Please try again.');
    }
  }

  // ------------ change password ------------
  async function handleChangePassword(event: React.FormEvent) {
  event.preventDefault();
  setPasswordError('');
  setPasswordSuccess('');

  // ---- Frontend password validation for new password ----
  if (!PASSWORD_REGEX.test(newPassword)) {
    setPasswordError(PASSWORD_RULE_MESSAGE);
    return;
  }

  const tokenToUse = getValidToken();
  if (!tokenToUse) {
    setPasswordError('No valid token found. Please log in again.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenToUse}`,
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
        confirmNewPassword,
      }),
    });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.message || 'Failed to change password.');
        return;
      }

      setPasswordSuccess('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError('Could not change password. Please try again.');
    }
  }

  // ------------ nicer UI styles ------------
  const profileCardStyle: React.CSSProperties = {
    ...cardStyle,
    padding: '2rem',
    maxWidth: '520px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  };

  const headerRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.25rem',
  };

  const avatarStyle: React.CSSProperties = {
    width: '56px',
    height: '56px',
    borderRadius: '999px',
    background:
      'radial-gradient(circle at 30% 30%, #60a5fa, #2563eb)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#f9fafb',
    fontWeight: 700,
    fontSize: '1.5rem',
    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)',
  };

  const headerTextStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };

  const headerNameStyle: React.CSSProperties = {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: '#111827',
  };

  const headerEmailStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    color: '#6b7280',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    color: '#9ca3af',
    fontWeight: 600,
    marginBottom: '0.4rem',
  };

  const summaryBoxStyle: React.CSSProperties = {
    borderRadius: '0.75rem',
    backgroundColor: '#f9fafb',
    padding: '0.9rem 1rem',
    border: '1px solid #e5e7eb',
  };

  const summaryGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
    rowGap: '0.4rem',
    columnGap: '0.75rem',
    fontSize: '0.9rem',
  };

  const summaryLabelStyle: React.CSSProperties = {
    color: '#6b7280',
    fontWeight: 500,
  };

  const summaryValueStyle: React.CSSProperties = {
    color: '#111827',
    textAlign: 'right' as const,
  };

  const chipButtonStyle: React.CSSProperties = {
    padding: '0.35rem 0.9rem',
    borderRadius: '999px',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    fontSize: '0.78rem',
    cursor: 'pointer',
  };

  const primaryChipButtonStyle: React.CSSProperties = {
    ...chipButtonStyle,
    background: '#111827',
    borderColor: '#111827',
    color: '#f9fafb',
  };

  const inlineMessageStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    marginTop: '0.35rem',
  };

  const initial = displayName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <div style={profileCardStyle}>
      {/* Top: avatar + heading */}
      <div>
        <div style={headerRowStyle}>
          <div style={avatarStyle}>{initial}</div>
          <div style={headerTextStyle}>
            <span style={headerNameStyle}>{displayName}</span>
            {profile?.email && (
              <span style={headerEmailStyle}>{profile.email}</span>
            )}
          </div>
        </div>
        <p style={subtitleStyle}>View and edit your account.</p>
      </div>

      {loading && (
        <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
          Loading profile...
        </p>
      )}

      {error && <p style={errorTextStyle}>{error}</p>}
      {successMessage && (
        <p style={{ ...inlineMessageStyle, color: '#15803d' }}>
          {successMessage}
        </p>
      )}

      {!loading && !error && profile && (
        <>
          {/* Summary box */}
          <div>
            <div style={sectionTitleStyle}>Summary</div>
            <div style={summaryBoxStyle}>
              <div style={summaryGridStyle}>
                <span style={summaryLabelStyle}>Name</span>
                <span style={summaryValueStyle}>{profile.name}</span>

                <span style={summaryLabelStyle}>Email</span>
                <span style={summaryValueStyle}>{profile.email}</span>

                <span style={summaryLabelStyle}>Joined</span>
                <span style={summaryValueStyle}>
                  {new Date(profile.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: '0.6rem',
                display: 'flex',
                gap: '0.5rem',
              }}
            >
              <button
                type="button"
                style={chipButtonStyle}
                onClick={() => setIsEditingProfile((prev) => !prev)}
              >
                {isEditingProfile ? 'Cancel edit' : 'Edit profile'}
              </button>
            </div>
          </div>

          {/* Edit profile form */}
          {isEditingProfile && (
            <form onSubmit={handleSaveProfile}>
              <div style={sectionTitleStyle}>Edit details</div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="profile-name">
                  Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="profile-email">
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <button type="submit" style={buttonStyle}>
                Save changes
              </button>
            </form>
          )}

          {/* Password section */}
          <div>
            <div style={sectionTitleStyle}>Password</div>
            <button
              type="button"
              style={primaryChipButtonStyle}
              onClick={() => setShowPasswordForm((prev) => !prev)}
            >
              {showPasswordForm ? 'Cancel password change' : 'Change password'}
            </button>

            {passwordError && (
              <p style={{ ...inlineMessageStyle, color: '#b91c1c' }}>
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p style={{ ...inlineMessageStyle, color: '#15803d' }}>
                {passwordSuccess}
              </p>
            )}

            {showPasswordForm && (
              <form
                onSubmit={handleChangePassword}
                style={{ marginTop: '0.7rem' }}
              >
                <div style={formGroupStyle}>
                  <label style={labelStyle} htmlFor="old-password">
                    Current password
                  </label>
                  <input
                    id="old-password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle} htmlFor="new-password">
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>

                <div style={formGroupStyle}>
                  <label
                    style={labelStyle}
                    htmlFor="confirm-new-password"
                  >
                    Confirm new password
                  </label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>

                <button type="submit" style={buttonStyle}>
                  Save new password
                </button>
              </form>
            )}
          </div>
        </>
      )}

      {!loading && !error && !profile && (
        <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
          No profile data could be loaded.
        </p>
      )}
    </div>
  );
}

// ================== Main App ==================

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const navigate = useNavigate();

  // Try auto-login using Remember Me (with 1-day expiry)
  useEffect(() => {
    const stored = localStorage.getItem('authData');

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          setIsLoggedIn(true);
          setUserName(parsed.userName);
          setAuthToken(parsed.token);
        } else {
          localStorage.removeItem('authData');
        }
      } catch (e) {
        console.error('Failed to parse authData from localStorage', e);
        localStorage.removeItem('authData');
      }
    }
  }, []);

  // called from login + signup
  function handleAuthSuccess(
    displayName: string,
    token: string | null = null,
    rememberMe: boolean = false
  ) {
    setIsLoggedIn(true);
    setUserName(displayName);
    if (token) {
      setAuthToken(token);

      if (rememberMe) {
        const authData = {
          token,
          userName: displayName,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        };
        localStorage.setItem('authData', JSON.stringify(authData));
      }
    }
    navigate('/');
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setUserName(null);
    setAuthToken(null);
    localStorage.removeItem('authData');
    navigate('/login');
  }

  return (
    <div style={appContainerStyle}>
      <header style={headerStyle}>
        <span
          style={{
            fontWeight: 700,
            letterSpacing: '0.03em',
            fontSize: '1rem',
          }}
        >
          Auth App
        </span>

        {isLoggedIn && (
          <div style={headerRightStyle}>
            <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>
              Hi, {userName || 'User'}
            </span>
            <button
              type="button"
              style={headerButtonStyle}
              onClick={() => navigate('/profile')}
            >
              Profile
            </button>
            <button
              type="button"
              style={{
                ...headerButtonStyle,
                background: '#111827',
                color: '#f9fafb',
              }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      <div style={contentWrapperStyle}>
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <HomePage userName={userName} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <LoginPage onLoginSuccess={handleAuthSuccess} />
              )
            }
          />

          <Route
            path="/signup"
            element={isLoggedIn ? <Navigate to="/" replace /> : <SignUpPage />}
          />


          <Route
            path="/profile"
            element={
              isLoggedIn ? (
                <ProfilePage
                userName={userName}
                token={authToken}
                onNameChange={(name) => setUserName(name)}
              />
            ) : (
              <Navigate to="/login" replace />
           )
        }  
      />

        </Routes>
      </div>
    </div>
  );
}

export default App;
