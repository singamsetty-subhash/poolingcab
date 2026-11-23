package com.rideshare.app;
import org.springframework.dao.OptimisticLockingFailureException;import org.springframework.http.*;import org.springframework.web.bind.annotation.*;import jakarta.persistence.OptimisticLockException;import java.util.Map;
@RestControllerAdvice class ApiErrors {
 @ExceptionHandler({OptimisticLockingFailureException.class,OptimisticLockException.class}) ResponseEntity<?> stale(){return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error","Seats changed while you were requesting. Refresh and try again."));}
}
