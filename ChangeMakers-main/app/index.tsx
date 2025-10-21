import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

const COLORS = {
  primary: '#007BFF',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    light: '#f8f9fa',
    medium: '#6c757d',
    dark: '#343a40'
  },
};

// export default function AuthScreen() {
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [name, setName] = useState('');

//   const handleAuth = () => {
//     // In a real app, you would implement actual authentication here
//     console.log(isLogin ? 'Logging in...' : 'Signing up...', { email, password, name });

//     // Navigate to the main app
//     router.replace('/(tabs)/home');
//   };

//   const toggleAuthMode = () => {
//     setIsLogin(!isLogin);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar style="auto" />
//       <KeyboardAvoidingView 
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardView}
//       >
//         <View style={styles.content}>
//           {/* Logo/App Title */}
//           <View style={styles.logoContainer}>
//             <Text style={styles.appTitle}>ChangeMakers</Text>
//             <Text style={styles.appTagline}>Connect. Collaborate. Change.</Text>
//           </View>

//           {/* Form Section */}
//           <View style={styles.formContainer}>
//             <Text style={styles.formTitle}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
//             <Text style={styles.formSubtitle}>
//               {isLogin ? 'Sign in to continue' : 'Join our community of changemakers'}
//             </Text>

//             {/* Name field (only for signup) */}
//             {!isLogin && (
//               <TextInput
//                 style={styles.input}
//                 placeholder="Full Name"
//                 value={name}
//                 onChangeText={setName}
//                 autoCapitalize="words"
//               />
//             )}

//             {/* Email field */}
//             <TextInput
//               style={styles.input}
//               placeholder="Email"
//               value={email}
//               onChangeText={setEmail}
//               keyboardType="email-address"
//               autoCapitalize="none"
//             />

//             {/* Password field */}
//             <TextInput
//               style={styles.input}
//               placeholder="Password"
//               value={password}
//               onChangeText={setPassword}
//               secureTextEntry
//             />

//             {/* Auth button */}
//             <TouchableOpacity 
//               style={styles.authButton} 
//               onPress={handleAuth}
//             >
//               <Text style={styles.authButtonText}>
//                 {isLogin ? 'Login' : 'Sign Up'}
//               </Text>
//             </TouchableOpacity>

//             {/* Toggle between login/signup */}
//             <TouchableOpacity 
//               style={styles.toggleContainer}
//               onPress={toggleAuthMode}
//             >
//               <Text style={styles.toggleText}>
//                 {isLogin ? 'New user? ' : 'Already have an account? '}
//                 <Text style={styles.toggleLink}>
//                   {isLogin ? 'Sign Up' : 'Login'}
//                 </Text>
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: COLORS.gray.medium,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.gray.dark,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.gray.medium,
    marginBottom: 24,
  },
  input: {
    backgroundColor: COLORS.gray.light,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  authButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: COLORS.gray.medium,
  },
  toggleLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
}); 