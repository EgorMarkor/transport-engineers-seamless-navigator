import 'package:vector_math/vector_math.dart' as vm;

/// A dynamic Kalman filter for 2D position and velocity.
/// The state vector is [x, y, vx, vy].
class DynamicKalmanFilter {
  // State vector: [x, y, vx, vy]
  vm.Vector4 state;
  // 4x4 state covariance matrix
  vm.Matrix4 covariance;
  // Time step between updates (seconds)
  double dt;

  // State transition matrix F (4x4)
  vm.Matrix4 F;
  // Process noise covariance Q (4x4)
  vm.Matrix4 Q;
  // Measurement noise covariance R (2x2)
  vm.Matrix2 R;
  // Measurement matrix H (2x4), fixed: it extracts position from the state.
  // In our case: H = [[1, 0, 0, 0],
  //                   [0, 1, 0, 0]]

  DynamicKalmanFilter({
    required this.dt,
    vm.Vector4? initialState,
    vm.Matrix4? initialCovariance,
    vm.Matrix4? processNoise,
    vm.Matrix2? measurementNoise,
  })  : state = initialState ?? vm.Vector4.zero(),
        covariance = initialCovariance ?? vm.Matrix4.identity() * 50.0,
        Q = processNoise ?? vm.Matrix4.identity() * 0.01,
        R = measurementNoise ?? vm.Matrix2.identity() * 30.0,
        F = vm.Matrix4.identity() {
    // Set up F for constant velocity:
    // F = [ [1, 0, dt, 0],
    //       [0, 1, 0, dt],
    //       [0, 0, 1,  0],
    //       [0, 0, 0,  1] ]
    F.setEntry(0, 2, dt);
    F.setEntry(1, 3, dt);
  }

  /// Prediction step: update the state and covariance based on the dynamic model.
  void predict() {
    // Predicted state: x = F * x
    state = F.transform(state);
    // Predicted covariance: P = F * P * F^T + Q
    covariance = F * covariance * F.transposed() + Q;
  }

  /// Update step: fuse a new position measurement (from trilateration) into the state.
  /// [measurement] is a Vector2 representing the measured [x, y] position.
  void update(vm.Vector2 measurement) {
    // Our measurement model H extracts the position from the state:
    // predictedMeasurement = H * state = [x, y]
    vm.Vector2 predictedMeasurement = vm.Vector2(state.x, state.y);
    // Innovation (residual) is the difference between measurement and prediction.
    vm.Vector2 innovation = measurement - predictedMeasurement;

    // S = H * P * H^T + R.
    // Since H = [ [1,0,0,0], [0,1,0,0] ], the product H * P * H^T is simply
    // the upper-left 2x2 submatrix of P.
    vm.Matrix2 S = vm.Matrix2.zero();
    S.setEntry(0, 0, covariance.entry(0, 0));
    S.setEntry(0, 1, covariance.entry(0, 1));
    S.setEntry(1, 0, covariance.entry(1, 0));
    S.setEntry(1, 1, covariance.entry(1, 1));
    S += R;

    // Compute the Kalman gain K = P * H^T * S^{-1}.
    // Since H^T is [ [1,0], [0,1], [0,0], [0,0] ], P * H^T
    // is the 4x2 matrix consisting of the first two columns of P.
    // We represent K as a list of four Vector2 (each row of the 4x2 gain).
    List<vm.Vector2> K = List.generate(4, (_) => vm.Vector2.zero());
    for (int i = 0; i < 4; i++) {
      K[i].x = covariance.entry(i, 0);
      K[i].y = covariance.entry(i, 1);
    }

    // Invert S (a 2x2 matrix)
    double detS = S.entry(0, 0) * S.entry(1, 1) - S.entry(0, 1) * S.entry(1, 0);
    if (detS == 0) return; // Should not happen if S is positive definite.
    vm.Matrix2 Sinv = vm.Matrix2.zero();
    Sinv.setEntry(0, 0, S.entry(1, 1) / detS);
    Sinv.setEntry(0, 1, -S.entry(0, 1) / detS);
    Sinv.setEntry(1, 0, -S.entry(1, 0) / detS);
    Sinv.setEntry(1, 1, S.entry(0, 0) / detS);

    // Multiply each row of (P*H^T) by Sinv to obtain K.
    // For each row i:
    // K[i] = [K[i].x, K[i].y] * Sinv.
    for (int i = 0; i < 4; i++) {
      double kx = K[i].x;
      double ky = K[i].y;
      K[i].x = kx * Sinv.entry(0, 0) + ky * Sinv.entry(1, 0);
      K[i].y = kx * Sinv.entry(0, 1) + ky * Sinv.entry(1, 1);
    }

    // Update the state: state = state + K * innovation.
    // That is, for each element i: state[i] = state[i] + K[i].x * innovation.x + K[i].y * innovation.y.
    vm.Vector4 innovationState = vm.Vector4(
      K[0].x * innovation.x + K[0].y * innovation.y,
      K[1].x * innovation.x + K[1].y * innovation.y,
      K[2].x * innovation.x + K[2].y * innovation.y,
      K[3].x * innovation.x + K[3].y * innovation.y,
    );
    state += innovationState;

    // Update covariance: P = (I - K*H) * P.
    // Since H = [ [1,0,0,0], [0,1,0,0] ], the product K*H is a 4x4 matrix where
    // the (i,0) entry is K[i].x and the (i,1) entry is K[i].y, with zeros in columns 2 and 3.
    // We can update P row-by-row.
    vm.Matrix4 I = vm.Matrix4.identity();
    vm.Matrix4 KH = vm.Matrix4.identity();
    for (int i = 0; i < 4; i++) {
      // For column 0:
      KH.setEntry(i, 0, I.entry(i, 0) - K[i].x);
      // For column 1:
      KH.setEntry(i, 1, I.entry(i, 1) - K[i].y);
      // For columns 2 and 3, H has zeros so they remain unchanged.
      KH.setEntry(i, 2, I.entry(i, 2));
      KH.setEntry(i, 3, I.entry(i, 3));
    }
    covariance = KH * covariance;
  }
}
