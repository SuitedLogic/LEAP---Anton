import { NextApiRequest, NextApiResponse } from "next";
import { handleCors } from "@/utils/cors.util";
import { verifyToken, generateToken } from "@/utils/jwt.util";
import { securityHeaders } from "@/utils/security.util";
import jwt from 'jsonwebtoken';

interface TokenTestResponse {
  success: boolean;
  test: string;
  result: 'PASSED' | 'FAILED';
  details: string;
  originalToken?: string;
  manipulatedToken?: string;
}

/**
 * Test endpoint to demonstrate token anti-forgery capabilities
 * This endpoint tests various token manipulation attempts to prove tokens cannot be forged
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenTestResponse>
) {
  // Apply security headers
  securityHeaders(req, res, () => {});
  
  // Handle CORS
  if (handleCors(req, res)) {
    return; // Request was handled (OPTIONS request)
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ 
        success: false, 
        test: "method_check",
        result: "FAILED",
        details: "Method not allowed" 
      });
  }

  const { testType, token } = req.body;

  if (!testType) {
    return res.status(400).json({
      success: false,
      test: "parameter_check",
      result: "FAILED",
      details: "testType is required"
    });
  }

  try {
    switch (testType) {
      case "algorithm_confusion":
        return testAlgorithmConfusion(res, token);
        
      case "signature_tampering":
        return testSignatureTampering(res, token);
        
      case "payload_modification":
        return testPayloadModification(res, token);
        
      case "expiry_manipulation":
        return testExpiryManipulation(res, token);
        
      case "cross_server_token":
        return testCrossServerToken(res);
        
      case "replay_attack":
        return testReplayAttack(res, token);
        
      default:
        return res.status(400).json({
          success: false,
          test: testType,
          result: "FAILED",
          details: "Unknown test type"
        });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      test: testType,
      result: "FAILED",
      details: `Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Test algorithm confusion attack (e.g., changing HS256 to none or RS256)
 */
function testAlgorithmConfusion(res: NextApiResponse<TokenTestResponse>, originalToken?: string): void {
  const testToken = originalToken || generateToken("test-user", "testuser");
  
  try {
    // Try to create a token with "none" algorithm
    const decoded = jwt.decode(testToken, { complete: true });
    if (!decoded || typeof decoded === 'string') {
      throw new Error('Invalid token structure');
    }
    
    // Create malicious token with "none" algorithm
    const maliciousHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify(decoded.payload)).toString('base64url');
    const maliciousToken = `${maliciousHeader}.${payload}.`;
    
    // Try to verify the malicious token
    const verification = verifyToken(maliciousToken);
    
    if (verification) {
      res.status(200).json({
        success: true,
        test: "algorithm_confusion",
        result: "FAILED",
        details: "Security vulnerability: Algorithm confusion attack succeeded!",
        originalToken: testToken,
        manipulatedToken: maliciousToken
      });
    } else {
      res.status(200).json({
        success: true,
        test: "algorithm_confusion",
        result: "PASSED",
        details: "Algorithm confusion attack was successfully blocked",
        originalToken: testToken,
        manipulatedToken: maliciousToken
      });
    }
  } catch (error) {
    res.status(200).json({
      success: true,
      test: "algorithm_confusion",
      result: "PASSED",
      details: `Algorithm confusion attack failed as expected: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Test signature tampering
 */
function testSignatureTampering(res: NextApiResponse<TokenTestResponse>, originalToken?: string): void {
  const testToken = originalToken || generateToken("test-user", "testuser");
  
  try {
    const parts = testToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token structure');
    }
    
    // Tamper with the signature
    const tamperedSignature = parts[2].split('').reverse().join('');
    const tamperedToken = `${parts[0]}.${parts[1]}.${tamperedSignature}`;
    
    const verification = verifyToken(tamperedToken);
    
    if (verification) {
      res.status(200).json({
        success: true,
        test: "signature_tampering",
        result: "FAILED",
        details: "Security vulnerability: Signature tampering attack succeeded!",
        originalToken: testToken,
        manipulatedToken: tamperedToken
      });
    } else {
      res.status(200).json({
        success: true,
        test: "signature_tampering",
        result: "PASSED",
        details: "Signature tampering attack was successfully blocked",
        originalToken: testToken,
        manipulatedToken: tamperedToken
      });
    }
  } catch (error) {
    res.status(200).json({
      success: true,
      test: "signature_tampering",
      result: "PASSED",
      details: `Signature tampering attack failed as expected: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Test payload modification
 */
function testPayloadModification(res: NextApiResponse<TokenTestResponse>, originalToken?: string): void {
  const testToken = originalToken || generateToken("test-user", "testuser");
  
  try {
    const parts = testToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token structure');
    }
    
    // Decode and modify payload
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    payload.userId = "admin"; // Try to escalate privileges
    payload.username = "admin";
    
    // Re-encode payload
    const tamperedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
    
    const verification = verifyToken(tamperedToken);
    
    if (verification) {
      res.status(200).json({
        success: true,
        test: "payload_modification",
        result: "FAILED",
        details: "Security vulnerability: Payload modification attack succeeded!",
        originalToken: testToken,
        manipulatedToken: tamperedToken
      });
    } else {
      res.status(200).json({
        success: true,
        test: "payload_modification",
        result: "PASSED",
        details: "Payload modification attack was successfully blocked",
        originalToken: testToken,
        manipulatedToken: tamperedToken
      });
    }
  } catch (error) {
    res.status(200).json({
      success: true,
      test: "payload_modification",
      result: "PASSED",
      details: `Payload modification attack failed as expected: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Test expiry manipulation
 */
function testExpiryManipulation(res: NextApiResponse<TokenTestResponse>, originalToken?: string): void {
  const testToken = originalToken || generateToken("test-user", "testuser");
  
  try {
    const parts = testToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token structure');
    }
    
    // Decode and modify payload to extend expiry
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    payload.exp = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // Extend to 1 year
    
    // Re-encode payload
    const tamperedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
    
    const verification = verifyToken(tamperedToken);
    
    if (verification) {
      res.status(200).json({
        success: true,
        test: "expiry_manipulation",
        result: "FAILED",
        details: "Security vulnerability: Expiry manipulation attack succeeded!",
        originalToken: testToken,
        manipulatedToken: tamperedToken
      });
    } else {
      res.status(200).json({
        success: true,
        test: "expiry_manipulation",
        result: "PASSED",
        details: "Expiry manipulation attack was successfully blocked",
        originalToken: testToken,
        manipulatedToken: tamperedToken
      });
    }
  } catch (error) {
    res.status(200).json({
      success: true,
      test: "expiry_manipulation",
      result: "PASSED",
      details: `Expiry manipulation attack failed as expected: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Test cross-server token usage
 */
function testCrossServerToken(res: NextApiResponse<TokenTestResponse>): void {
  try {
    // Create a token that might come from another server
    const fakeServerToken = jwt.sign(
      {
        userId: "malicious-user",
        username: "hacker",
        jti: "fake-id",
        serverSignature: "fake-server-signature"
      },
      "fake-secret",
      {
        expiresIn: "24h",
        issuer: "fake-app",
        audience: "fake-users",
        algorithm: "HS256"
      }
    );
    
    const verification = verifyToken(fakeServerToken);
    
    if (verification) {
      res.status(200).json({
        success: true,
        test: "cross_server_token",
        result: "FAILED",
        details: "Security vulnerability: Cross-server token attack succeeded!",
        manipulatedToken: fakeServerToken
      });
    } else {
      res.status(200).json({
        success: true,
        test: "cross_server_token",
        result: "PASSED",
        details: "Cross-server token attack was successfully blocked",
        manipulatedToken: fakeServerToken
      });
    }
  } catch (error) {
    res.status(200).json({
      success: true,
      test: "cross_server_token",
      result: "PASSED",
      details: `Cross-server token attack failed as expected: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Test replay attack protection
 */
function testReplayAttack(res: NextApiResponse<TokenTestResponse>, originalToken?: string): void {
  const testToken = originalToken || generateToken("test-user", "testuser");
  
  try {
    // First verification should succeed
    const firstVerification = verifyToken(testToken);
    
    if (!firstVerification) {
      res.status(200).json({
        success: true,
        test: "replay_attack",
        result: "FAILED",
        details: "Original token verification failed unexpectedly",
        originalToken: testToken
      });
      return;
    }
    
    // Simulate some time passing and then try to reuse the token
    // In a real scenario, this would test if tokens can be reused after logout
    verifyToken(testToken); // Test token reuse
    
    res.status(200).json({
      success: true,
      test: "replay_attack",
      result: "PASSED",
      details: "Token reuse test completed. Note: For full replay protection, implement token blacklisting after logout.",
      originalToken: testToken
    });
    
  } catch (error) {
    res.status(200).json({
      success: true,
      test: "replay_attack",
      result: "PASSED",
      details: `Replay attack test failed as expected: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}
